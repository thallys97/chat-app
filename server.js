const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
