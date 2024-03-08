// create-room.js

// Defina participantIds no escopo global para que possa ser acessada por várias funções
let participantIds = [];
let selectedUsers = {}; // Objeto para armazenar os usuários selecionados
let clearResultsButton; // Declare a variável no escopo global



// Função para limpar os resultados da busca
function clearSearchResults() {
    document.getElementById('user-search-results').innerHTML = '';
    document.getElementById('user-search-input').value = '';
    clearResultsButton.style.display = 'none'; // Esconde o botão
}

// Vamos mover a criação e configuração do botão para dentro de uma função que será chamada no DOMContentLoaded
function setupClearResultsButton() {
    // Adicione um botão de limpar após o container de resultados
    clearResultsButton = document.querySelector('.clear-results'); // Use a variável do escopo global
    clearResultsButton.id = 'clear-results-button';
    clearResultsButton.style.display = 'none'; // Começa escondido
    clearResultsButton.addEventListener('click', clearSearchResults);
}

// Função para inicializar a lista de participantes com o usuário atual
function initializeParticipantList() {
    const currentUserId = localStorage.getItem('userID');
    const currentUsername = localStorage.getItem('username');

    if (currentUserId && currentUsername) {
        addUserToParticipantList(currentUserId, currentUsername);
    }
}

// Chame esta função quando o DOM for carregado para incluir o usuário atual
document.addEventListener('DOMContentLoaded', () => {
    initializeParticipantList();
    setupClearResultsButton();
});

// Função para adicionar usuário à lista de participantes
function addUserToParticipantList(userId, username) {
    if (!participantIds.includes(userId)) {
        participantIds.push(userId);
        selectedUsers[userId] = username;
        updateSelectedUsersList();
    }
}

// Função para atualizar a lista de usuários selecionados na tela
function updateSelectedUsersList() {
    const listElement = document.getElementById('selected-users-list');
    listElement.innerHTML = ''; // Limpa a lista
    Object.entries(selectedUsers).forEach(([userId, username]) => {
        const userElement = document.createElement('div');
        userElement.textContent = username + ' (adicionado)';
        listElement.appendChild(userElement);
    });
}

// Função para buscar usuários e exibir os resultados
async function fetchAndDisplayUsers(searchTerm) {
    const response = await fetch('/search-users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ searchTerm })
    });

    if (response.ok) {
        const users = await response.json();
        const resultsContainer = document.getElementById('user-search-results');
        resultsContainer.innerHTML = ''; // Limpa resultados anteriores
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.classList.add('user-result');
            userElement.textContent = user.username;
            const addButton = document.createElement('button');
            addButton.classList.add('add-user-button');
            addButton.textContent = 'Adicionar usuário';
            addButton.addEventListener('click', () => {
                addUserToParticipantList(user._id, user.username);
                addButton.textContent = 'Adicionado';
                addButton.disabled = true;
            });
            // Verifique se o usuário já está na lista antes de adicionar o botão
            if (!participantIds.includes(user._id)) {
                userElement.appendChild(addButton);
            }
            resultsContainer.appendChild(userElement);
        });
        if (users.length > 0) {
            clearResultsButton.style.display = 'block'; // Mostra o botão se houver resultados
        } else {
            clearResultsButton.style.display = 'none'; //Esconde o botão se não houver resultados
        }    
    }
}

document.getElementById('create-room-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const roomName = document.getElementById('room-name').value;

    try {
        const response = await fetch('/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name: roomName, participantIds })
        });

        if (response.ok) {
            const roomData = await response.json();
            // Lógica para lidar com a sala criada, como redirecionar para a sala ou atualizar a lista de salas
            alert('Sala criada com sucesso!');
            window.location.href = `/chat-room.html?roomId=${roomData._id}`;
        } else {
            throw new Error('Falha ao criar sala');
        }
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        alert('Erro ao criar sala: ' + error.message);
    }
});

document.getElementById('user-search-input').addEventListener('input', (event) => {
    const searchTerm = event.target.value;

    if (searchTerm.length > 2) { // Buscar quando o termo de busca tiver pelo menos 3 caracteres
        fetchAndDisplayUsers(searchTerm);
    } 
});
