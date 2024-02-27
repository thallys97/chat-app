const socket = io(); 
    
    
    socket.on('private message', function(message) {
        if (message.senderID === myUserID || message.receiverID === myUserID) {
            // A mensagem é para ou de mim
            displayPrivateMessage(message);
        }
    });

    function displayPrivateMessage(message) {
        // Adicione a mensagem à conversa privada na UI
        // Você precisará diferenciar visualmente as mensagens privadas das públicas
    }
    
// Função para buscar usuários com base no input de busca
async function fetchUsers(searchTerm) {
    
    const response = await fetch('/search-users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ searchTerm: searchTerm }) // Garanta que searchTerm seja uma string
    });
    if (response.ok) {
        const users = await response.json();
        displaySearchResults(users);
    } else {
        // É uma boa prática lidar com erros aqui
        console.error('Falha ao buscar usuários:', await response.text());
    }
}

// Função para exibir os resultados da busca
function displaySearchResults(users) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores

    if (users.length === 0) {
        resultsContainer.textContent = 'Usuário não encontrado.';
        return;
    }

    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user.username;
        userElement.style.cursor = 'pointer';
        userElement.onclick = () => showStartChatOption(user._id, user.username);
        resultsContainer.appendChild(userElement);
    });
}

    // Função para mostrar opção de iniciar chat privado
    function showStartChatOption(userID, username) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = `Iniciar chat privado com ${username}? <button onclick="startPrivateChat('${userID}')">Sim</button>`;
    }




    // function displayUserList(users) {
    //     const userSearchContainer = document.getElementById('user-search-container');
    //     userSearchContainer.innerHTML = ''; // Limpar lista de usuários existente
    //     users.forEach(user => {
    //         const userElement = document.createElement('div');
    //         userElement.textContent = user.username;
    //         userElement.onclick = () => startPrivateChat(user._id);
    //         userSearchContainer.appendChild(userElement);
    //     });
    // }

    function startPrivateChat(receiverID) {
        // Iniciar chat privado
        socket.emit('start private chat', { receiverID });
    }


    const token = localStorage.getItem('token');
    if (token) {

        document.getElementById('private-chat-search-btn').addEventListener('click', function() {
            const searchTerm = document.getElementById('private-chat-user-search-input').value.trim();
            if (searchTerm) {
                fetchUsers(searchTerm);
            }
        });
    };