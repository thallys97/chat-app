// Suponha que você tenha uma função para adicionar uma nova marcação de chat privado na barra lateral
function addPrivateChatToSidebar(username) {
    const privateChatsContainer = document.getElementById('private-chats-container');
    const chatItem = document.createElement('div');
    chatItem.textContent = username;
    chatItem.className = 'sidebar-item';
    chatItem.addEventListener('click', function() {
      // Aqui você pode abrir o chat privado com o usuário clicado
    });
    privateChatsContainer.appendChild(chatItem);
  }

  document.getElementById('general-chat').addEventListener('click', function() {
      // Aqui você pode redirecionar para o chat geral ou apenas atualizar a UI
      window.location.href = '/'; // Se o chat geral for a página index
    });
    
    document.getElementById('create-private-chat').addEventListener('click', function() {
      // Aqui você pode abrir uma nova página ou um modal para criar um chat privado
      window.location.href = '/create-private-chat.html'; // Se você tiver uma página separada para isso
    });
    
  
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
