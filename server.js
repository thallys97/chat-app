const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Inicia o Socket.io com o servidor HTTP

const PORT = 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Novo usuário conectado');
    socket.broadcast.emit('chat message', 'Um novo usuário se juntou ao chat!');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        io.emit('chat message', 'Um usuário saiu do chat.');
    });
});


server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

