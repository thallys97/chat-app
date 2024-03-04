

  
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



// Função para criar o botão de colapso, a lista de participantes e o link para cada sala
function createRoomElement(room) {
    // Criação do elemento da sala
    const roomElement = document.createElement('div');
    roomElement.className = 'sidebar-item';
  
    const roomLink = document.createElement('a');
    roomLink.href = `/chat-room.html?roomId=${room._id}`;
    roomLink.textContent = room.name;
  
    const collapseButton = document.createElement('button');
    collapseButton.textContent = '▼';
    collapseButton.className = 'collapse-button';
    collapseButton.onclick = () => toggleParticipants(room._id, collapseButton);
  
    const participantsList = document.createElement('ul');
    participantsList.className = 'participants-list';
    participantsList.style.display = 'none'; // Inicialmente oculto
  
    roomElement.appendChild(roomLink);
    roomElement.appendChild(collapseButton);
    roomElement.appendChild(participantsList);
  
    return roomElement;
  }

  // Função para alternar a visualização dos participantes
async function toggleParticipants(roomId, button) {
    const participantsList = button.nextElementSibling;
  
    if (participantsList.style.display === 'none') {
      // Buscar participantes e exibir
      const participants = await fetchParticipants(roomId);
      participantsList.innerHTML = ''; // Limpar lista existente
      participants.forEach(participant => {
        const participantItem = document.createElement('li');
        participantItem.textContent = participant.username;
        participantsList.appendChild(participantItem);
      });
      participantsList.style.display = 'block';
      button.textContent = '▲';
    } else {
      // Ocultar lista
      participantsList.style.display = 'none';
      button.textContent = '▼';
    }
  }


  // Função para buscar os participantes de uma sala privada
async function fetchParticipants(roomId) {
  // Certifique-se de que o token está sendo enviado no cabeçalho de autorização
    const token = localStorage.getItem('token');
    const response = await fetch(`/rooms/${roomId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
    if (response.ok) {
      const participants = await response.json();
      return participants;
    } else {
      console.error('Falha ao buscar participantes:', response.status);
      return [];
    }
  }


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
            privateChatsContainer.innerHTML = ''; // Limpe a lista existente antes de adicionar novas salas
            rooms.forEach(room => {
              const roomElement = createRoomElement(room);
              privateChatsContainer.appendChild(roomElement);
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

document.getElementById('toggle-private-chats').addEventListener('click', function() {
    const privateChatsList = document.getElementById('private-chats-container');
    const toggleIcon = document.getElementById('toggle-private-chats');

    // Verifica se a lista está visível
    if (privateChatsList.style.display === 'none') {
        privateChatsList.style.display = 'block'; // Mostra a lista
        toggleIcon.textContent = '▼'; // Atualiza o ícone para '▼'
    } else {
        privateChatsList.style.display = 'none'; // Esconde a lista
        toggleIcon.textContent = '►'; // Atualiza o ícone para '►'
    }
});
