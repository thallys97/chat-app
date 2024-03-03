

  
// side-bar.js
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggle-sidebar');
const chatContainer = document.getElementById('chat-container');
const sidebarItems = sidebar.querySelectorAll('.sidebar-item, .sidebar-title'); // Pega todos os elementos da sidebar que devem ser mostrados/ocultados

toggleButton.addEventListener('click', function() {
    // Verifica se a sidebar está visível pela presença do estilo de 'display' em um dos itens internos
    const isSidebarVisible = sidebarItems[0].style.display !== 'none';

    // Alterna a largura da sidebar e o estilo de display dos elementos internos
    if (isSidebarVisible) {
        //sidebar.style.width = '0'; // Esconde a sidebar
        sidebar.style.display = 'none';
        //chatContainer.style.marginLeft = '0'; // Ajusta o chat container
        sidebarItems.forEach(item => item.style.display = 'none'); // Esconde os itens da sidebar
    } else {
        sidebar.style.width = '250px'; // Mostra a sidebar
        sidebar.style.display = 'block';
        //chatContainer.style.marginLeft = '250px'; // Ajusta o chat container
        sidebarItems.forEach(item => item.style.display = 'block'); // Mostra os itens da sidebar
    }
});


// Função para buscar salas privadas do usuário e adicionar à barra lateral
async function fetchAndDisplayUserRooms(userID) {
    try {
        // Certifique-se de que o token está sendo enviado no cabeçalho de autorização
        const token = localStorage.getItem('token');
        const response = await fetch(`/rooms/user/${userID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const rooms = await response.json();
            const privateChatsContainer = document.getElementById('private-chats-container');
            rooms.forEach(room => {
                const roomLink = document.createElement('div');
                roomLink.className = 'sidebar-item';
                roomLink.innerHTML = `<a href="/chat-room.html?roomId=${room._id}">${room.name}</a>`;
                privateChatsContainer.appendChild(roomLink);
            });
        } else {
            // Lida com a resposta não-OK, como erros de autorização
            console.error('Não foi possível buscar as salas:', response.status);
        }
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
    }
}

// Chamar a função quando o DOM estiver pronto ou quando o usuário fizer login
document.addEventListener('DOMContentLoaded', () => {
    const userID = localStorage.getItem('userID');
    if (userID) {
        fetchAndDisplayUserRooms(userID);
    }
});
