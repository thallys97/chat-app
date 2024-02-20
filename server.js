const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./messageModel'); // Importa o modelo de mensagem
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Substitua 'your_mongodb_connection_string' pela sua string de conexão do MongoDB
mongoose.connect('mongodb://localhost:27017/messages');

const PORT = 3000;

app.use(express.static('public'));


app.use(express.json());
app.use(cookieParser());

// Rota de registro

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('Usuário registrado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao registrar usuário.');
    }
});

// Rota de login

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});



app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Credenciais inválidas.');
        }
        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send('Login bem-sucedido!');
    } catch (error) {
        res.status(500).send('Erro ao fazer login.');
    }
});

const withAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send('Não autorizado: Nenhum token fornecido.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = decoded.userID;
        next();
    } catch (error) {
        res.status(401).send('Não autorizado: Token inválido.');
    }
};

// Use o middleware 'withAuth' nas rotas que você deseja proteger
app.use('/protected-route', withAuth, (req, res) => {
    res.send('Esta rota está protegida.');
});



// Configure o Multer e o local de armazenamento dos arquivos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Certifique-se de que este diretório exista
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nomeando o arquivo
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});


// Rota de upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ url: url });
    } else {
        res.status(400).send('Nenhum arquivo foi enviado.');
    }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));



io.on('connection', async (socket) => {
    // Enviar mensagens anteriores
    try {
        // Encontre as 100 mensagens mais recentes e ordene-as do mais novo para o mais antigo
        const messages = await Message.find().sort({ timestamp: -1 }).limit(100);
        // Reverter a ordem das mensagens para que a mais antiga apareça primeiro
        socket.emit('init', messages.reverse());
    } catch (err) {
        console.error(err);
    }

    // Ouvinte para novas mensagens
    socket.on('chat message', async (data) => {
        
        socket.username = data.username;
        
        
        try {
            let messageData = {
                username: data.username,
                timestamp: new Date(),
            };
    
            if (data.text) {
                messageData.text = data.text; // Mensagem de texto
            }  
            
            if (data.type === 'info') {  
                messageData.text = data.text; // Mensagem do sistema
                messageData.type = 'info';
            } 
            
            if (data.file && data.type === 'image') {
                messageData.image = data.file; // URL da imagem
                messageData.type = 'image';
            } 
            
            if (data.file && data.type === 'video') {
                messageData.video = data.file; // URL do vídeo
                messageData.type = 'video';
            }  
            
            if (data.type === 'link') {
                messageData.link = data.text; // URL do vídeo
                messageData.type = 'link';
            }    

    
            const newMessage = new Message(messageData);
            const savedMessage = await newMessage.save();

            //console.log(savedMessage)

            io.emit('chat message', savedMessage);
        } catch (err) {
            console.error('Erro ao salvar a mensagem:', err);
        }
    });
    

    socket.on('set username', async (username) => {
        socket.username = username; // Armazena o nome de usuário na sessão do socket
        const joinMessage = new Message({
            username: 'System',
            text: `${username} has entered the chat`,
            type: 'info'
        });

        

        await joinMessage.save();
        io.emit('chat message', joinMessage);

        // console.log(joinMessage);
    });


    socket.on('logout', async (username) => {
        socket.username = username;
        //socket.isLogoutIntentional = true; // Define a flag para logout intencional

        const leftMessage = new Message({
            username: 'System',
            text: `${username} has left the chat`,
            type: 'info'
        });
        await leftMessage.save();
        io.emit('chat message', leftMessage);
    });


        // Ouvinte para mensagens privadas
        socket.on('private message', (data) => {
            // 'data' deve incluir 'text' e 'receiverID'
            const { receiverID, text } = data;
            const newMessage = new Message({
                senderID: socket.userID, // O ID do remetente agora é obtido pelo token
                receiverID,
                text,
                type: 'private'
            });
            newMessage.save();
            
            // Envia a mensagem para o socket específico do receptor
            const receiverSocket = io.sockets.connected[receiverID];
            if (receiverSocket) {
                receiverSocket.emit('private message', newMessage);
            } else {
                socket.emit('error', 'Usuário não encontrado.');
            }
        });

     // Middleware para verificar o token do socket
    socket.use(([event, data], next) => {
        if (event === 'private message') {
            try {
                const token = data.token;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userID = decoded.userID;   
                next();
            } catch (error) {
                next(new Error('Não autorizado: Token inválido.'));
            }
        } else {
            next();
        }      
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

