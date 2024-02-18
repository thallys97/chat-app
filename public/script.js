// Adicione esta linha no topo do seu arquivo script.js
import { EmojiButton } from 'https://unpkg.com/@joeattardi/emoji-button@latest';

const socket = io(); // Inicia a conexão WebSocket com o servidor

document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const setUsernameBtn = document.getElementById('set-username-btn');
    const logoutBtn = document.getElementById('logout-btn');
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


    let username = localStorage.getItem('username') || '';


    if (username) {
        // Se o nome de usuário estiver definido, mostra o form e o botão de emoji
        messageForm.style.display = 'block';
        emojiButton.style.display = 'inline-block'; // ou 'block', dependendo do seu layout
        usernameInput.style.display = 'none';
        setUsernameBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        messageInput.focus();
    } else {
        // Se o nome de usuário não estiver definido, esconde o form e o botão de emoji
        messageForm.style.display = 'none';
        emojiButton.style.display = 'none';
        logoutBtn.style.display = 'none';
    }

    // Função para definir o nome de usuário
    function setUsername() {
        username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('username', username); // Armazena o nome de usuário no localStorage
            socket.emit('set username', username); // Notify the server of the new username
            usernameInput.style.display = 'none';
            setUsernameBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            messageInput.focus();
        } else {
            alert('Por favor, insira um nome de usuário válido.');
        }
    }

    // Adiciona um ouvinte de evento ao botão de definir nome de usuário
    setUsernameBtn.addEventListener('click', function () {
        setUsername();
        // socket.emit('set username', username);
        window.location.reload();
    });


    // Adiciona um ouvinte de evento ao botão de sair
    logoutBtn.addEventListener('click', function() {
        socket.emit('logout', username); // Optionally notify the server that the user is logging ou
        localStorage.removeItem('username'); // Remove o nome de usuário do localStorage
        window.location.reload(); // Recarrega a página para redefinir o estado
    });


    // Função para fazer upload de arquivos
    async function uploadFile(file) {
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
    
        if (messageText && username) {
            // Se houver texto, envia uma mensagem de texto
            socket.emit('chat message', { username: username, text: messageText });
            messageInput.value = '';
        } else if (file) {
            // Se houver um arquivo, você precisa fazer upload para um servidor ou serviço de armazenamento de arquivos
            // Depois de fazer upload do arquivo e obter a URL, você pode enviar essa URL como uma mensagem
            uploadFile(file).then(response => {
                const url = response.url;
                socket.emit('chat message', { username: username, file: url, type: file.type.startsWith('image/') ? 'image' : 'video' });
                messageInput.value = '';
                document.getElementById('file-input').value = ''; // Limpar o campo de arquivo
            }).catch(error => {
                console.error('Falha ao enviar arquivo', error);
            });
        }
    });

    // Função para exibir mensagens
    function displayMessage(data) {  

        const messageElement = document.createElement('div');
    
        if (data.type === 'info') {

            // console.log(data.username + ":" + data.text);

            // Estiliza e exibe mensagens do sistema
            const infoElement = document.createElement('p');
            infoElement.innerHTML = `<em>${data.text}</em>`;
            infoElement.style.color = 'grey';
            messageElement.appendChild(infoElement);
            
        } else if (data.type === 'image') {

            console.log(data);

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
            // Exibir o vídeo
            const videoElement = document.createElement('video');
            videoElement.src = data.file;
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
            // Exibir mensagem de texto
            messageElement.textContent = `${data.username}: ${data.text}`;
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
