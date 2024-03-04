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
const Room = require('./roomModel');

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
        // const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET);
        res.json({ token, userID: user._id }); // Envia o token para o cliente

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

        // const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET);
        res.json({ token, userID: user._id }); // Envie o token como JSON

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



app.post('/create-room', withAuth, async (req, res) => {
    try {
        const { name, participantIds } = req.body;
        // Verificar se todos os participantIds são válidos e únicos
        const uniqueParticipantIds = [...new Set(participantIds)];
        const participants = await User.find({ _id: { $in: uniqueParticipantIds } });

        // Verificar se todos os usuários existem
        if (participants.length !== uniqueParticipantIds.length) {
            return res.status(400).send('Alguns usuários não foram encontrados.');
        }

        const newRoom = new Room({
            name,
            createdBy: req.userID,
            participants: [...participants.map(u => u._id)]
            //participants: [req.userID, ...participants.map(u => u._id)]
        });

        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        console.error('Erro ao criar sala:', error);
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
        if (typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return res.status(400).send('Termo de pesquisa deve ser uma string não vazia.');
        }
        
        const regex = new RegExp(searchTerm.trim(), 'i');
        const users = await User.find({
            username: regex,
            _id: { $ne: req.userID }
        }, 'username _id'); // Somente retorna o username e o _id

        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

// Rota para buscar o histórico de mensagens de uma sala
app.get('/rooms/:roomID/messages', withAuth, async (req, res) => {
    try {
      const messages = await Message.find({ roomID: req.params.roomID }).sort({ timestamp: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).send('Erro ao buscar mensagens.');
    }
  });


 // Adicionar esta rota no seu server.js
app.get('/rooms/user/:userID', withAuth, async (req, res) => {
    try {
        const userID = req.params.userID;
        const rooms = await Room.find({ participants: userID });
        res.json(rooms);
    } catch (error) {
        res.status(500).send('Erro ao buscar salas.');
    }
});

// Rota para buscar os participantes de uma sala específica
app.get('/rooms/:roomId/participants', withAuth, async (req, res) => {
    try {
        // Obtenha o roomId dos parâmetros da rota
        const roomId = req.params.roomId;

        // Encontre a sala pelo ID
        const room = await Room.findById(roomId).populate('participants', 'username');

        if (!room) {
            return res.status(404).send('Sala não encontrada.');
        }

        // Verifique se o usuário atual é um dos participantes da sala
        if (!room.participants.some(participant => participant._id.toString() === req.userID)) {
            return res.status(403).send('Acesso negado.');
        }

        // Mapeie os participantes para obter apenas as informações necessárias
        const participants = room.participants.map(participant => ({
            id: participant._id,
            username: participant.username
        }));

        res.json(participants);
    } catch (error) {
        console.error('Erro ao buscar participantes:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});


app.get('/search-gifs', async (req, res) => {
    const query = req.query.q;
    const apiKey = process.env.GIPHY_API_KEY;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}`;
  
    try {
      const giphyResponse = await fetch(url);
      const giphyData = await giphyResponse.json();
      res.json(giphyData.data); // Envie apenas os dados necessários para o cliente
    } catch (error) {
      console.error('Erro ao buscar GIFs:', error);
      res.status(500).send('Erro ao buscar GIFs');
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
    

    //SESSÃO DO CHAT PRIVADO

    socket.on('joinRoom', ({ roomID, userID }) => {
        socket.join(roomID);
        // Enviar histórico de mensagens para o usuário
        Message.find({ roomID: roomID })
          .sort({ timestamp: 1 })
          .then(messages => {
            socket.emit('history', messages);
          });
      });
    
      socket.on('message', ({ roomID, message }) => {
        // Crie um novo objeto de mensagem com o tipo 'gif' se aplicável
        const newMessageData = {
          text: message.text,
          username: message.username,
          roomID: roomID,
          timestamp: new Date(), // ou Date.now()
          // Outros campos conforme necessário
        };
      
        if (message.type === 'gif') {
          newMessageData.gif = message.text; // A URL do GIF está em message.text
          newMessageData.type = 'gif';
        }
      
        const newMessage = new Message(newMessageData);
        newMessage.save().then(savedMessage => {
          io.to(roomID).emit('message', savedMessage);
        });
      });
    
      socket.on('leaveRoom', ({ roomID }) => {
        socket.leave(roomID);
      });
    



});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

