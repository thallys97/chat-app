const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./messageModel'); // Importa o modelo de mensagem

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Substitua 'your_mongodb_connection_string' pela sua string de conexão do MongoDB
mongoose.connect('mongodb://localhost:27017/messages');

const PORT = 3000;
app.use(express.static('public'));

io.on('connection', async (socket) => {
    try {
        const messages = await Message.find().sort('timestamp').limit(100).exec();
        socket.emit('init', messages);
    } catch (err) {
        console.error(err);
    }

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

