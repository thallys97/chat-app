  
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
function createRoomElement(room, currentUserID) {
    // Criação do elemento da sala
    const roomElement = document.createElement('div');
    roomElement.className = 'sidebar-item';
    roomElement.id = `room-${room._id}`;
  
    const roomLink = document.createElement('a');
    roomLink.href = `/chat-room.html?roomId=${room._id}`;
    roomLink.textContent = room.name;
  
    const collapseButton = document.createElement('button');
    collapseButton.textContent = '►';
    collapseButton.className = 'collapse-button';
    collapseButton.onclick = () => toggleParticipants(room._id, collapseButton);
  
    const participantsList = document.createElement('ul');
    participantsList.className = 'participants-list';
    participantsList.style.display = 'none'; // Inicialmente oculto

        // Cria o botão de sair/apagar com base se o usuário é o criador ou não
        const actionButton = document.createElement('button');
        actionButton.classList.add('leave-room-button');
        if (room.createdBy === currentUserID) {
            actionButton.textContent = 'Apagar sala';
            actionButton.onclick = () => deleteRoom(room._id);
        } else {
            actionButton.textContent = 'Sair da sala';
            actionButton.onclick = () => leaveRoom(room._id);
        }
  
    roomElement.appendChild(roomLink);
    roomElement.appendChild(collapseButton);
    roomElement.appendChild(participantsList);
    roomElement.appendChild(actionButton);
  
    return roomElement;
  }

// Função para sair da sala
function leaveRoom(roomId) {
  fetch(`/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  }).then(response => {
      if (response.ok) {
          // Remove a sala da barra lateral
          document.getElementById(`room-${roomId}`).remove();
          window.location.href = 'index.html';
        } else {
          response.text().then(text => {
              console.error('Falha ao sair da sala:', text);
          });
      }
  });
}

// Função para apagar sala
function deleteRoom(roomId) {
  if (confirm('Tem certeza que deseja apagar esta sala?')) {
      fetch(`/rooms/${roomId}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      }).then(response => {
          if (response.ok) {
            // Remove a sala da barra lateral
            document.getElementById(`room-${roomId}`).remove();
            window.location.href = 'index.html';
          } else {
            response.text().then(text => {
                console.error('Falha ao apagar a sala:', text);
            });
        }
      });
  }
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
      button.textContent = '▼';
    } else {
      // Ocultar lista
      participantsList.style.display = 'none';
      button.textContent = '►';
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
              const roomElement = createRoomElement(room, userID);
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


function highlightCurrentLocation() {
  const currentPage = window.location.pathname.split("/").pop(); // Isso pegará o nome da página atual como 'index.html'
  
  // Remova a classe 'active' de todos os itens primeiro
  const allSidebarLinks = document.querySelectorAll('#sidebar .sidebar-item');
  allSidebarLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Destacar o item da barra lateral com base na página atual
  switch (currentPage) {
    case 'index.html':
      document.querySelector('#general-chat').classList.add('active');
      break;
    case 'create-room.html':
      document.querySelector('#create-private-chat').classList.add('active');
      break;
    case 'create-channel.html':
      document.querySelector('#create-channel').classList.add('active');
      break;
    case 'search-channel.html':
      document.querySelector('#search-channel').classList.add('active');
      break;
    // Se não for nenhuma das páginas estáticas, verifica se estamos numa sala ou canal
    default:
      const urlParams = new URLSearchParams(window.location.search);
      const currentRoomId = urlParams.get('roomId');
      const currentChannelId = urlParams.get('channelId');
      
      if (currentRoomId) {
        const activeRoomElement = document.getElementById(`room-${currentRoomId}`);
        if (activeRoomElement) {
          activeRoomElement.classList.add('active');
        }
      }
      
      if (currentChannelId) {
        const activeChannelElement = document.getElementById(`channel-${currentChannelId}`);
        if (activeChannelElement) {
          activeChannelElement.classList.add('active');
        }
      }
      break;
  }
}


// Chamar a função quando o DOM estiver pronto ou quando o usuário fizer login
document.addEventListener('DOMContentLoaded', () => {
    const userID = localStorage.getItem('userID');
    if (userID) {
      fetchAndDisplayUserRooms(userID).then(highlightCurrentLocation);
      fetchAndDisplayUserChannels(userID).then(highlightCurrentLocation);
      highlightCurrentLocation();
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

// socket.on('user left', data => {
//   const leftUserId = data.userId;
//   document.querySelectorAll(`.participant-${leftUserId}`).forEach(el => el.remove());
//   });
  
//   socket.on('room deleted', data => {
//   const deletedRoomId = data.roomId;
//   document.querySelector(`.room-${deletedRoomId}`).remove();
//   });



///////////////////////////////// ÁREA DE CANAIS //////////////////////////////////////
///////////////////////////////// ÁREA DE CANAIS //////////////////////////////////////
///////////////////////////////// ÁREA DE CANAIS //////////////////////////////////////
///////////////////////////////// ÁREA DE CANAIS //////////////////////////////////////


document.getElementById('toggle-channels').addEventListener('click', function() {
  const channelsList = document.getElementById('channels-list-container');
  const toggleIcon = document.getElementById('toggle-channels');

  // Verifica se a lista está visível
  if (channelsList.style.display === 'none') {
      channelsList.style.display = 'block'; // Mostra a lista
      toggleIcon.textContent = '▼'; // Atualiza o ícone para '▼'
  } else {
      channelsList.style.display = 'none'; // Esconde a lista
      toggleIcon.textContent = '►'; // Atualiza o ícone para '►'
  }
});



// Função para criar o botão de colapso, a lista de participantes e o link para cada sala
function createChannelElement(channel, currentUserID) {
  // Criação do elemento da sala
  const channelElement = document.createElement('div');
  channelElement.className = 'sidebar-item';
  channelElement.id = `channel-${channel._id}`;

  const channelLink = document.createElement('a');
  channelLink.href = `/channel.html?channelId=${channel._id}`;
  channelLink.textContent = channel.name;

  const collapseButton = document.createElement('button');
  collapseButton.textContent = '►';
  collapseButton.className = 'collapse-button';
  collapseButton.onclick = () => toggleParticipantsChannel(channel._id, collapseButton);

  const participantsList = document.createElement('ul');
  participantsList.className = 'participants-list';
  participantsList.style.display = 'none'; // Inicialmente oculto

      // Cria o botão de sair/apagar com base se o usuário é o criador ou não
      const actionButton = document.createElement('button');
      actionButton.classList.add('leave-channel-button');
      if (channel.createdBy === currentUserID) {
          actionButton.textContent = 'Apagar canal';
          actionButton.onclick = () => deleteChannel(channel._id);
      } else {
          actionButton.textContent = 'Sair do canal';
          actionButton.onclick = () => leaveChannel(channel._id);
      }

  channelElement.appendChild(channelLink);
  channelElement.appendChild(collapseButton);
  channelElement.appendChild(participantsList);
  channelElement.appendChild(actionButton);

  return channelElement;
}


// Função para sair da sala
function leaveChannel(channelId) {
  fetch(`/channels/${channelId}/leave`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
  }).then(response => {
      if (response.ok) {
          // Remove a sala da barra lateral
          document.getElementById(`channel-${channelId}`).remove();
          window.location.href = 'index.html';
        } else {
          response.text().then(text => {
              console.error('Falha ao sair da sala:', text);
          });
      }
  });
}


// Função para apagar sala
function deleteChannel(channelId) {
  if (confirm('Tem certeza que deseja apagar este canal?')) {
      fetch(`/channels/${channelId}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      }).then(response => {
          if (response.ok) {
            // Remove a sala da barra lateral
            document.getElementById(`channel-${channelId}`).remove();
            window.location.href = 'index.html';
          } else {
            response.text().then(text => {
                console.error('Falha ao apagar a sala:', text);
            });
        }
      });
  }
}



  // Função para alternar a visualização dos participantes
  async function toggleParticipantsChannel(channelId, button) {
    const participantsList = button.nextElementSibling;
  
    if (participantsList.style.display === 'none') {
      // Buscar participantes e exibir
      const participants = await fetchParticipantsChannel(channelId);
      participantsList.innerHTML = ''; // Limpar lista existente
      participants.forEach(participant => {
        const participantItem = document.createElement('li');
        participantItem.textContent = participant.username;
        participantsList.appendChild(participantItem);
      });
      participantsList.style.display = 'block';
      button.textContent = '▼';
    } else {
      // Ocultar lista
      participantsList.style.display = 'none';
      button.textContent = '►';
    }
  }


    // Função para buscar os participantes de uma sala privada
async function fetchParticipantsChannel(channelId) {
  // Certifique-se de que o token está sendo enviado no cabeçalho de autorização
    const token = localStorage.getItem('token');
    const response = await fetch(`/channels/${channelId}/participants`, {
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
async function fetchAndDisplayUserChannels(userID) {
  try {
      // Certifique-se de que o token está sendo enviado no cabeçalho de autorização
      const token = localStorage.getItem('token');
      const response = await fetch(`/channels/user/${userID}`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const channels = await response.json();
          const channelsListContainer = document.getElementById('channels-list-container');
          channelsListContainer.innerHTML = ''; // Limpe a lista existente antes de adicionar novas salas
          channels.forEach(channel => {
            const channelElement = createChannelElement(channel, userID);
            channelsListContainer.appendChild(channelElement);
          });
        } else {
          // Lida com a resposta não-OK, como erros de autorização
          console.error('Não foi possível buscar as salas:', response.status);
      }
  } catch (error) {
      console.error('Erro ao buscar salas:', error);
  }
} 
