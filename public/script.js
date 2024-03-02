// Adicione esta linha no topo do seu arquivo script.js
import { EmojiButton } from 'https://unpkg.com/@joeattardi/emoji-button@latest';

const socket = io(); // Inicia a conexão WebSocket com o servidor

// Função para verificar se o usuário está logado
function checkAuth() {
    const token = localStorage.getItem('token');
    const authContainer = document.getElementById('auth-container');
    const logoutBtn = document.getElementById('logout-btn');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');
    const emojiButton = document.querySelector('#emoji-button');
    //const userSearch = document.getElementById('user-search-container');
    const sidebarChat = document.getElementById('sidebar');
    const sidebarChatBtn = document.getElementById('toggle-sidebar');
    const chatContainer = document.getElementById('chat-container');
    
    if (token) {
        // Se o token existir, assumimos que o usuário está logado
        if (authContainer) {
            authContainer.style.display = 'none';
        }   
        sidebarChatBtn.style.display = 'block';
        sidebarChat.style.display = 'block';

        if(chatContainer){
            messageForm.style.display = 'flex';
            emojiButton.style.display = 'inline-block'; // ou 'block', dependendo do seu layout
            logoutBtn.style.display = 'block';

            messageInput.focus();
        }
        
        //userSearch.style.display = 'block';

        

    } else {
        // Se não houver token, o usuário não está logado
        if(chatContainer){

            logoutBtn.style.display = 'none';
            messageForm.style.display = 'none';
            emojiButton.style.display = 'none';
        }
        
        sidebarChatBtn.style.display = 'none';
        sidebarChat.style.display = 'none';
        if (authContainer) {
            authContainer.style.display = 'block';
        }

        //userSearch.style.display = 'none';
    }
}

// // Adicione funções para lidar com login e registro
// async function login(username, password) {
//     // Implemente a lógica de envio de dados de login para o servidor e armazenamento do token
// }

// async function register(username, password) {
//     // Implemente a lógica de envio de dados de registro para o servidor
// }

async function logout() {
    try {
        const token = localStorage.getItem('token');
        // Envia uma solicitação de logout ao servidor
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` // Envia o token no cabeçalho da requisição
            }
        });

        // Verifica se o logout foi bem-sucedido
        if (response.ok) {
            // Remove o token e o username do armazenamento local
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            // localStorage.removeItem('userID');
            // localStorage.removeItem('activeChat');

            // Desconecta o socket ao fazer logout
            socket.disconnect();

            // Recarrega a página
            window.location.reload();
        } else {
            // Lida com qualquer erro que possa ter ocorrido durante o logout
            console.error('Falha ao realizar logout');
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}




document.addEventListener('DOMContentLoaded', function() {

    // Verifica se o usuário está logado

    checkAuth();

      
    const token = localStorage.getItem('token');
    if (token) {
        const socket = io();
        
        socket.on('connect', () => {
        // Autentica o usuário assim que a conexão WebSocket é estabelecida
        socket.emit('authenticate', { token: token });
        });
        
        socket.on('authenticated', (data) => {
        // Atualiza a UI com o nome de usuário ou realiza outras ações necessárias
        //console.log('Usuário autenticado:', data.username);
        });

        // const searchUserBtn = document.getElementById('user-search-btn');
        // const searchUserInput = document.getElementById('user-search-input');
    
        // searchUserBtn.addEventListener('click', function() {
        //     const searchTerm = searchUserInput.value.trim();
        //     if (searchTerm) {
        //         fetchUsers(searchTerm);
        //     }
        // });

    }

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    loginBtn.addEventListener('click', function() {
        window.location.href = 'login.html'; // Redireciona para a página de login
    });

    registerBtn.addEventListener('click', function() {
        window.location.href = 'register.html'; // Redireciona para a página de registro
    });

    // logoutBtn.addEventListener('click', function() {
    //     // Limpar o token do localStorage e atualizar a interface
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('username');
    //     checkAuth();
    // });

    logoutBtn.addEventListener('click', logout );


    //const usernameInput = document.getElementById('username');
    //const setUsernameBtn = document.getElementById('set-username-btn');
    //const logoutBtn = document.getElementById('logout-btn');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');

    
    const emojiButton = document.querySelector('#emoji-button');
    const picker = new EmojiButton();

    
    picker.on('emoji', emojiObject => {
        const emojiString = emojiObject.emoji; 
        document.querySelector('#message-input').value += emojiString;
    });

    emojiButton.addEventListener('click', () => picker.togglePicker(emojiButton));


    //let username = localStorage.getItem('username') || '';


    // if (username) {
    //     // Se o nome de usuário estiver definido, mostra o form e o botão de emoji
    //     messageForm.style.display = 'flex';
    //     emojiButton.style.display = 'inline-block'; // ou 'block', dependendo do seu layout
    //     usernameInput.style.display = 'none';
    //     setUsernameBtn.style.display = 'none';
    //     logoutBtn.style.display = 'block';
    //     messageInput.focus();
    // } else {
    //     // Se o nome de usuário não estiver definido, esconde o form e o botão de emoji
    //     messageForm.style.display = 'none';
    //     emojiButton.style.display = 'none';
    //     logoutBtn.style.display = 'none';
    // }




    // Função para definir o nome de usuário
    // function setUsername() {
    //     username = usernameInput.value.trim();
    //     if (username) {
    //         localStorage.setItem('username', username); // Armazena o nome de usuário no localStorage
    //         socket.emit('set username', username); // Notify the server of the new username
    //         usernameInput.style.display = 'none';
    //         setUsernameBtn.style.display = 'none';
    //         logoutBtn.style.display = 'block';
    //         messageInput.focus();
    //     } else {
    //         alert('Por favor, insira um nome de usuário válido.');
    //     }
    // }

    // // Adiciona um ouvinte de evento ao botão de definir nome de usuário
    // setUsernameBtn.addEventListener('click', function () {
    //     setUsername();
    //     // socket.emit('set username', username);
    //     window.location.reload();
    // });


    // // Adiciona um ouvinte de evento ao botão de sair
    // logoutBtn.addEventListener('click', function() {
    //     socket.emit('logout', username); // Optionally notify the server that the user is logging ou
    //     localStorage.removeItem('username'); // Remove o nome de usuário do localStorage
    //     window.location.reload(); // Recarrega a página para redefinir o estado
    // });

    



    // Função para fazer upload de arquivos
    async function uploadFile(file) {

        if(file.size > 20 * 1024 * 1024) { // Se o arquivo for maior que 20 MB
            alert('O arquivo é muito grande. O tamanho máximo permitido é de 20 MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Falha ao fazer upload do arquivo');
        }

        return response.json();
    }



    // Envia a mensagem e arquivos
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
    
        const messageText = messageInput.value.trim();
        const file = document.getElementById('file-input').files[0];
        const username = localStorage.getItem('username');
    
        if (messageText) {

            
            // Se houver texto, envia uma mensagem de texto
            socket.emit('chat message', {username: username, text: messageText });
            messageInput.value = '';
        } else if (file) {
            // Se houver um arquivo, você precisa fazer upload para um servidor ou serviço de armazenamento de arquivos
            // Depois de fazer upload do arquivo e obter a URL, você pode enviar essa URL como uma mensagem
            uploadFile(file).then(response => {
                const url = response.url;
                socket.emit('chat message', {username: username, file: url, type: file.type.startsWith('image/') ? 'image' : 'video' });
                messageInput.value = '';
                document.getElementById('file-input').value = ''; // Limpar o campo de arquivo
            }).catch(error => {
                console.error('Falha ao enviar arquivo', error);
            });
        }
    });

    // Função para verificar se a mensagem contém um link e transformá-lo em um elemento clicável
    function createLinkElement(text) {
        // Regex para identificar URLs na mensagem
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        // Substitui todas as ocorrências de URLs por um elemento âncora
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    // Função para exibir mensagens
    function displayMessage(data) {  

        if(data.roomID){

            return;

        }

        const messageElement = document.createElement('div');
    
        if (data.type === 'info') {

            // console.log(data.username + ":" + data.text);

            // Estiliza e exibe mensagens do sistema
            const infoElement = document.createElement('p');
            infoElement.innerHTML = `<em>${data.text}</em>`;
            infoElement.style.color = 'grey';
            messageElement.appendChild(infoElement);
            
        } else if (data.type === 'image') {

            // console.log(data);

            // Exibir o nome do usuário
            const usernameImageElement = document.createElement('p');
            usernameImageElement.textContent = `${data.username}:`;
            messageElement.appendChild(usernameImageElement);

            // Exibir a imagem
            const imageElement = document.createElement('img');
            imageElement.classList.add('message-file');
            imageElement.src = data.image;
            imageElement.alt = 'Imagem enviada';
            messageElement.appendChild(imageElement);
        } else if (data.type === 'video') {

            // console.log(data);

            // Exibir o nome do usuário
            const usernameVideoElement = document.createElement('p');
            usernameVideoElement.textContent = `${data.username}:`;
            messageElement.appendChild(usernameVideoElement);

            // Exibir o vídeo
            const videoElement = document.createElement('video');
            videoElement.classList.add('message-file');
            videoElement.src = data.video;
            videoElement.alt = 'Video enviado';
            videoElement.controls = true;
            messageElement.appendChild(videoElement);
        } else if (data.type === 'link') {
            // Exibir o link
            const linkElement = document.createElement('a');
            linkElement.href = data.message; // Supondo que `data.message` contém a URL
            linkElement.textContent = data.message;
            linkElement.target = "_blank";
            messageElement.appendChild(linkElement);
        } else {
           
            // Verifica se a mensagem contém uma URL
            const messageWithLink = createLinkElement(data.text);

             // Exibir mensagem de texto
            messageElement.innerHTML = `${data.username}: ${messageWithLink}`;
        }
    
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll para a mensagem mais recente
    }

    // Ouvinte para mensagens
    socket.on('chat message', function(message) {

        displayMessage(message);
    });
    // Ouvinte para histórico de mensagens
    socket.on('init', function(messages) {
        messages.forEach(displayMessage);
    });

    socket.on('user joined', function(message) {
        displayMessage({ message: message, type: 'info' });
    });
    
    socket.on('user left', function(message) {
        displayMessage({ message: message, type: 'info' });
    });

    
    // socket.on('set username', function(message) {
    //     socket.emit('chat message', message);
    // });
    
    // socket.on('user left', function(message) {
    //     displayMessage({ message: message, type: 'info' });
    // });



});
