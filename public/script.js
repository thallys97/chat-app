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

    // Envia a mensagem
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita o recarregamento da página
        const message = messageInput.value.trim();
        if (message && username) {
            socket.emit('chat message', { username: username, message: message });
            messageInput.value = ''; // Limpa o campo de entrada
        }
    });

    // Função para exibir mensagens
    function displayMessage(data) {
        const { username, message, type } = data;
        const messageElement = document.createElement('div');
        if (type === 'info') {
            messageElement.innerHTML = `<em>${message}</em>`;
            messageElement.style.color = 'grey'; // Styling for info messages
        } else {
            messageElement.textContent = `${username}: ${message}`;
        }
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to latest message
    }

    // Ouvinte para mensagens
    socket.on('chat message', displayMessage);

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



});
