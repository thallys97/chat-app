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

    socket.on('set username', async (username) => {
        socket.username = username; // Armazena o nome de usuário na sessão do socket
        const joinMessage = new Message({
            username: 'System',
            message: `${username} has entered the chat`,
            type: 'info'
        });
        await joinMessage.save();
        io.emit('chat message', joinMessage);
    });


    socket.on('logout', async (username) => {
        socket.username = username;
        //socket.isLogoutIntentional = true; // Define a flag para logout intencional

        const leftMessage = new Message({
            username: 'System',
            message: `${username} has left the chat`,
            type: 'info'
        });
        await leftMessage.save();
        io.emit('chat message', leftMessage);
    });

    // socket.on('disconnect', async () => {
    //     if (socket.isLogoutIntentional) {
    //         // Se a desconexão foi intencional, não faz nada, pois a mensagem de saída já foi emitida
    //         socket.isLogoutIntentional = false; // Reseta a flag
    //     } else {
    //         // Trata desconexões que não são causadas por logout intencional
    //         if (socket.username) {
    //             const leftMessage = new Message({
    //                 username: 'System',
    //                 message: `${socket.username} has left the chat unexpectedly`,
    //                 type: 'info'
    //             });
    //             await leftMessage.save();
    //             io.emit('chat message', leftMessage);
    //         }
    //     }
    // });
    

});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

