const socket = io(); // Inicia a conexão WebSocket com o servidor

document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const setUsernameBtn = document.getElementById('set-username-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');

    let username = localStorage.getItem('username') || '';

    if (username) {
        usernameInput.style.display = 'none';
        setUsernameBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        messageInput.focus();
    } else {
        logoutBtn.style.display = 'none';
    }

    // Função para definir o nome de usuário
    function setUsername() {
        username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('username', username); // Armazena o nome de usuário no localStorage
            usernameInput.style.display = 'none';
            setUsernameBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            messageInput.focus();
        } else {
            alert('Por favor, insira um nome de usuário válido.');
        }
    }

    // Adiciona um ouvinte de evento ao botão de definir nome de usuário
    setUsernameBtn.addEventListener('click', setUsername);

    // Adiciona um ouvinte de evento ao botão de sair
    logoutBtn.addEventListener('click', function() {
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
        const { username, message } = data; // Desestruturação do objeto
        const messageElement = document.createElement('div');
        messageElement.textContent = `${username}: ${message}`;
        messagesContainer.appendChild(messageElement);
    }

    // Ouvinte para mensagens
    socket.on('chat message', displayMessage);

    // Ouvinte para histórico de mensagens
    socket.on('init', function(messages) {
        messages.forEach(displayMessage);
    });
});
