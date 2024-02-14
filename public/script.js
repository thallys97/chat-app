const socket = io(); // Inicia a conexão WebSocket com o servidor


document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages');

    let username = '';

    // Solicita o nome de usuário
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita o envio do formulário
            username = usernameInput.value.trim();
            if (username) {
                usernameInput.style.display = 'none'; // Esconde o campo de nome de usuário
                messageInput.focus(); // Move o foco para o campo de entrada de mensagem
            } else {
                alert('Por favor, insira um nome de usuário válido.');
            }
        }
    });

    // Envia a mensagem
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita o recarregamento da página
        const message = messageInput.value.trim();
        if (message && username) {
            // Emita a mensagem para o servidor
            socket.emit('chat message', { username: username, message: message });
            messageInput.value = ''; // Limpa o campo de entrada
        }
    });

    // Esta função precisa ser atualizada para lidar com objetos de mensagem
    function displayMessage(data) {
        const { username, message } = data; // Desestruturação do objeto
        const messageElement = document.createElement('div');
        messageElement.textContent = `${username}: ${message}`; // Combina o nome de usuário e a mensagem
        messagesContainer.appendChild(messageElement);
    }

    // Atualize o ouvinte para 'chat message' para usar a função displayMessage corrigida
    socket.on('chat message', function(data) {
        displayMessage(data);
    });

    // Ouvinte para 'init' com o histórico de mensagens
    socket.on('init', function(messages) {
        messages.forEach(function(message) {
            // Supondo que 'message' é um objeto com as propriedades 'username' e 'message'
            displayMessage(message);
        });
    });
    

});
