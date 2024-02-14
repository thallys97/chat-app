const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./messageModel'); // Importa o modelo de mensagem

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Substitua 'your_mongodb_connection_string' pela sua string de conexão do MongoDB
mongoose.connect('your_mongodb_connection_string', { useNewUrlParser: true, useUnifiedTopology: true });

const PORT = 3000;
app.use(express.static('public'));

io.on('connection', (socket) => {
    // Quando um usuário se conecta, envie o histórico de mensagens
    Message.find().sort('timestamp').limit(100).exec((err, messages) => {
        if (!err) {
            socket.emit('init', messages);
        }
    });

    socket.on('chat message', (data) => {
        // Salva a mensagem no banco de dados
        const newMessage = new Message({ username: data.username, message: data.message });
        newMessage.save();

        io.emit('chat message', data);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

