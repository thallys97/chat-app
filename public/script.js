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
            displayMessage(username, message);
            messageInput.value = ''; // Limpa o campo de entrada
        }
    });

    // Modifiquei a função displayMessage para enviar um objeto ao invés de uma string
    function displayMessage(message) {
        socket.emit('chat message', { username: username, message: message });
    }


    // Ouça mensagens de 'chat message' vindas do servidor e as exiba
    socket.on('chat message', function(msg) {
        const messageElement = document.createElement('div');
        messageElement.textContent = msg;
        messagesContainer.appendChild(messageElement);
    });

    socket.on('init', function(messages) {
        messages.forEach(function(message) {
            displayMessage(message); // Adapte conforme necessário para exibir corretamente
        });
    });
    

});
