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
    // Enviar mensagens anteriores
    try {
        const messages = await Message.find().sort({ timestamp: 1 }).limit(100); // Removido .exec() que é redundante aqui
        socket.emit('init', messages);
    } catch (err) {
        console.error(err);
    }

    // Ouvinte para novas mensagens
    socket.on('chat message', async (data) => {
        try {
            // Salva a mensagem no banco de dados
            const newMessage = new Message({ username: data.username, message: data.message });
            const savedMessage = await newMessage.save();
            
            // Emita a mensagem salva para todos os clientes
            io.emit('chat message', savedMessage);
        } catch (err) {
            console.error('Erro ao salvar a mensagem:', err);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

