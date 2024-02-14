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

    // Exibe a mensagem na interface
    function displayMessage(user, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${user}: ${message}`;
        messagesContainer.appendChild(messageElement);
    }
});
