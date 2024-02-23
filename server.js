const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./messageModel'); // Importa o modelo de mensagem
const User = require('./userModel');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { Console } = require('console');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Substitua 'your_mongodb_connection_string' pela sua string de conexão do MongoDB
mongoose.connect('mongodb://localhost:27017/messages');

const PORT = 3000;

const withAuth = (req, res, next) => {
    try {
        const tokenHeader = req.headers['authorization'];
        const token = tokenHeader && tokenHeader.split(' ')[1]; // Bearer TOKEN
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


app.use(express.static('public'));


app.use(express.json());
app.use(cookieParser());

// Rota de registro

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


// Adaptação da rota de registro para logar o usuário imediatamente após o registro
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Verifica se o usuário já existe
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).send('Usuário já existe.');
        }

        user = new User({ username, password });
        await user.save();

        // Loga o usuário e retorna um token
        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token }); // Envia o token para o cliente

        // Emita uma mensagem de boas-vindas no chat
        const joinMessage = new Message({
            username: 'System',
            text: `${username} has joined the chat`,
            type: 'info'
        });
        await joinMessage.save();
        io.emit('chat message', joinMessage);

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro no servidor.');
    }
});

// Rota de login

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});



// Rota de login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Credenciais inválidas.');
        }

        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token }); // Envie o token como JSON

        // Emita uma mensagem no chat indicando que o usuário entrou
        const joinMessage = new Message({
            username: 'System',
            text: `${username} has joined the chat`,
            type: 'info'
        });
        await joinMessage.save();
        io.emit('chat message', joinMessage);

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send('Erro ao fazer login.');
    }
});



// Rota de logout
app.post('/logout', withAuth, async (req, res) => {
    // A função withAuth já preenche req.userID se o token for válido
    try {
        // Busca o usuário pelo ID para obter o nome de usuário
        const user = await User.findById(req.userID);
        if (!user) {
            return res.status(400).send('Usuário não encontrado.');
        }

        // Limpa o cookie com o token JWT
        res.clearCookie('token');
        res.status(200).send('Logout bem-sucedido.');

        // Notifica todos os usuários que o usuário saiu
        const leftMessage = new Message({
            username: 'System',
            text: `${user.username} has left the chat`,
            type: 'info'
        });
        await leftMessage.save();
        io.emit('chat message', leftMessage);
    } catch (error) {
        console.error('Erro ao processar o logout:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});




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


app.get('/users', withAuth, async (req, res) => {
    try {
        // Encontre todos os usuários, exceto o próprio usuário que faz a solicitação
        const users = await User.find({ _id: { $ne: req.userID }}).select('username');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});


// Rota para buscar usuários
app.post('/search-users', withAuth, async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm;
        if (typeof searchTerm !== 'string') {
            throw new Error('searchTerm deve ser uma string');
        }
        const users = await User.find({
            username: { $regex: new RegExp(searchTerm, 'i') }, // Use o construtor RegExp para garantir que seja uma expressão regular
            _id: { $ne: req.userID }
        }).select('username');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});


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


         // Middleware para verificar o token do socket
         socket.use(async ([event, data], next) => {

            if (event === 'authenticate') { // Supondo que 'authenticate' é um novo evento para autenticação
                try {
                    const token = data.token;
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.userID);
                    if (!user) {
                        return next(new Error('Usuário não encontrado.'));
                    }
                    socket.username = user.username;   // Armazena o nome de usuário no objeto socket
                    next();
                } catch (error) {
                    next(new Error('Não autorizado: Token inválido.'));
                }
            } else {
                if (!socket.username) {
                    next(new Error('Não autorizado: Usuário não autenticado.'));
                } else {
                    next();
                }
            }
    
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
        
        
        socket.on('authenticate', async (data) => {
            try {
              const token = data.token;
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const user = await User.findById(decoded.userID);
              if (!user) {
                return socket.emit('error', 'Usuário não encontrado.');
              }
          
              socket.username = user.username; // Armazena o nome de usuário no objeto socket
          
              // Envia um evento 'authenticated' de volta para o cliente
              socket.emit('authenticated', { username: user.username });
          
              // Restante do código...
            } catch (error) {
              socket.emit('error', 'Não autorizado: Token inválido.');
            }
          });


    // Ouvinte para novas mensagens
    socket.on('chat message', async (data) => {
               
        try {
            let messageData = {
                username: data.username, // Usa o nome de usuário associado ao socket
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
    

    // socket.on('set username', async (username) => {
    //     socket.username = username; // Armazena o nome de usuário na sessão do socket
    //     const joinMessage = new Message({
    //         username: 'System',
    //         text: `${username} has entered the chat`,
    //         type: 'info'
    //     });

        

    //     await joinMessage.save();
    //     io.emit('chat message', joinMessage);

    //     // console.log(joinMessage);
    // });


    // socket.on('logout', async (username) => {
    //     socket.username = username;
    //     //socket.isLogoutIntentional = true; // Define a flag para logout intencional

    //     const leftMessage = new Message({
    //         username: 'System',
    //         text: `${username} has left the chat`,
    //         type: 'info'
    //     });
    //     await leftMessage.save();
    //     io.emit('chat message', leftMessage);
    // });

    socket.on('start private chat', ({ receiverID }) => {
        // Código para iniciar um chat privado
    });


        // Ouvinte para mensagens privadas
        socket.on('private message', async ({ receiverID, text }) => {
            try {
                const newMessage = new Message({
                    senderID: socket.userID,
                    receiverID,
                    text,
                    type: 'private'
                });
                await newMessage.save();
                socket.to(receiverID).emit('private message', newMessage);
            } catch (error) {
                console.error('Erro ao enviar mensagem privada:', error);
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

