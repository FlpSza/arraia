const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco MySQL
const db = mysql.createConnection({
  host: 'yamabiko.proxy.rlwy.net',
  port: 44190,
  user: 'root',
  password: 'QSEdESUHBlkZjHklLQjkFGROinEbsXRW',
  database: 'railway'
});

app.use(express.json());
app.use(express.static(__dirname));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning']
}));

app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// 🔍 Buscar confirmados
app.get('/confirmados', (req, res) => {
  db.query('SELECT nome, presente FROM convidados', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// 🔍 Buscar todos os presentes disponíveis (sem filtro)
app.get('/opcoes', (req, res) => {
  db.query('SELECT id, presente_nome FROM opcoes', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// ✅ Registrar confirmação (sem marcar presente como indisponível)
app.post('/confirmar', (req, res) => {
  const { nome, itemId } = req.body;
  if (!nome || !itemId) return res.status(400).send('Nome e item obrigatórios');

  db.query('SELECT presente_nome FROM opcoes WHERE id = ?', [itemId], (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar presente');
    if (results.length === 0) return res.status(400).send('Presente não encontrado');

    const { presente_nome } = results[0];
    db.query(
      'INSERT INTO convidados (nome, presente) VALUES (?, ?)',
      [nome, presente_nome],
      (err) => {
        if (err) return res.status(500).send('Erro ao registrar convidado');
        res.send('🎉 Confirmação registrada com sucesso!');
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
