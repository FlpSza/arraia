const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Configuração do banco MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'arraia'
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 

// 1. Buscar confirmados
app.get('/confirmados', (req, res) => {
  db.query('SELECT nome, comida, bebida FROM convidados', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// 2. Buscar opções disponíveis
app.get('/opcoes', (req, res) => {
  db.query('SELECT id, descricao, tipo FROM opcoes WHERE disponivel = 1', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// 3. Adicionar confirmação
app.post('/confirmar', (req, res) => {
  const { nome, itemId } = req.body;
  if (!nome || !itemId) return res.status(400).send('Nome e item obrigatórios');

  // Buscar o item para saber se é comida ou bebida
    db.query('SELECT descricao, tipo FROM opcoes WHERE id = ? AND disponivel = 1', [itemId], (err, results) => {
        if (err) return res.status(500).send('Erro ao buscar item');
        if (results.length === 0) return res.status(400).send('Item não disponível');

    const { descricao, tipo } = results[0];

    // Inserir convidado
    db.query(
      'INSERT INTO convidados (nome, comida, bebida) VALUES (?, ?, ?)',
      [nome, descricao, null],
      (err) => {
        if (err) return res.status(500).send('Erro ao salvar convidado');

        // Marcar item como indisponível
        db.query('UPDATE opcoes SET disponivel = 0 WHERE id = ?', [itemId], (err) => {
          if (err) return res.status(500).send('Erro ao atualizar item');
          res.send('Confirmação registrada com sucesso!');
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});