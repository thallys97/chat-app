// Adicione esta linha no topo do seu arquivo script.js
import { EmojiButton } from 'https://unpkg.com/@joeattardi/emoji-button@latest';

const socket = io();
const roomID = new URLSearchParams(window.location.search).get('roomId');
const userID = localStorage.getItem('userID');


const emojiButton = document.querySelector('#emoji-button');
    const picker = new EmojiButton();

    
    picker.on('emoji', emojiObject => {
        const emojiString = emojiObject.emoji; 
        document.querySelector('#message-input').value += emojiString;
    });

  emojiButton.addEventListener('click', () => picker.togglePicker(emojiButton));



 // Essa função precisa ser chamada quando o usuário seleciona um GIF ou quando a pesquisa é cancelada
function closeGifModal() {
  gifModal.style.display = "none";
  gifSearchResults.innerHTML = '';
} 

// Função para enviar a mensagem com o GIF
function sendGifMessage(gifUrl) {
  socket.emit('message', {
    roomID,
    message: {
      text: gifUrl,
      userID,
      username: localStorage.getItem('username'),
      type: 'gif'
    }
  });
  // Limpa a busca e os resultados do GIF após o envio
  gifSearchInput.value = '';
  gifSearchResults.innerHTML = '';
}

const gifModal = document.getElementById('gif-modal');
const gifSearchInput = document.getElementById('gif-search-input');
const gifSearchResults = document.getElementById('gif-search-results');
const closeModal = document.getElementById('close-modal');


// Abre o modal
document.getElementById('gif-button').addEventListener('click', () => {
  gifModal.style.display = 'block';
  gifSearchInput.focus();
});

// Fecha o modal quando clicar em 'x'
closeModal.onclick = function() {
  gifModal.style.display = "none";
}

// Fecha o modal ao clicar fora dele
window.onclick = function(event) {
  if (event.target === gifModal) {
    gifModal.style.display = "none";
  }
}

// Pesquisar GIFs enquanto digita
gifSearchInput.addEventListener('input', () => {
  const searchTerm = gifSearchInput.value;
  if (searchTerm.length > 2) { // Evita buscar por strings muito curtas
    searchGifs(searchTerm);
  } else {
    gifSearchResults.innerHTML = ''; // Limpa resultados se a busca for muito curta
  }
});


  //função para lidar com a busca de GIFs
  async function searchGifs(query) {
    const url = `/search-gifs?q=${encodeURIComponent(query)}`;
  
    try {
      const response = await fetch(url);
      const gifs = await response.json();
      //const gifResults = document.getElementById('gif-results');
      gifSearchResults.innerHTML = ''; // Limpa os resultados anteriores
      gifs.forEach(gif => {
        const img = document.createElement('img');
        img.src = gif.images.fixed_height.url;
        img.addEventListener('click', () => {
          sendGifMessage(gif.images.fixed_height.url);
          gifModal.style.display = "none"; // Fecha o modal após a seleção
        });
        gifSearchResults.appendChild(img);
      });
  
    } catch (error) {
      console.error('Erro ao buscar GIFs:', error);
    }
  }


socket.emit('joinRoom', { roomID, userID });

socket.on('history', (messages) => {
  const messagesList = document.getElementById('messages');
  messagesList.innerHTML = ''; // Limpa as mensagens existentes antes de carregar o histórico

  messages.forEach((message) => {
    const li = document.createElement('li');
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('message-username');
    usernameSpan.innerText = message.username;

    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('message-timestamp');
    const date = new Date(message.timestamp);
    timestampSpan.innerText = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    messageContent.appendChild(usernameSpan);
    messageContent.appendChild(timestampSpan);

    if (message.type === 'gif') {
      const gifImage = document.createElement('img');
      gifImage.src = message.text; // A URL do GIF está em message.text
      gifImage.classList.add('gif-image');
      messageContent.appendChild(gifImage);
    } else {
      const textDiv = document.createElement('div');
      textDiv.innerText = message.text;
      messageContent.appendChild(textDiv);
    }

    li.appendChild(messageContent);
    messagesList.appendChild(li);
  });

  // Após carregar o histórico, mova o foco para o campo de entrada de mensagem
  document.getElementById('message-input').focus();
});

socket.on('message', (message) => {
  const li = document.createElement('li');
  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');

  const usernameSpan = document.createElement('span');
  usernameSpan.classList.add('message-username');
  usernameSpan.innerText = message.username;

  const timestampSpan = document.createElement('span');
  timestampSpan.classList.add('message-timestamp');
  
  // Formatar a data para o formato "dia/mês/ano hora:minuto"
  const date = new Date(message.timestamp);
  timestampSpan.innerText = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;


  messageContent.appendChild(usernameSpan);
  messageContent.appendChild(timestampSpan);

  if (message.type === 'gif') {
    const gifImage = document.createElement('img');
    gifImage.src = message.text; // A URL do GIF está em message.text
    gifImage.classList.add('gif-image');
    messageContent.appendChild(gifImage);
  } else {
    const textDiv = document.createElement('div');
    textDiv.innerText = message.text;
    messageContent.appendChild(textDiv);
  }

  li.appendChild(messageContent);
  document.getElementById('messages').appendChild(li);

  // Após carregar o histórico, mova o foco para o campo de entrada de mensagem
  document.getElementById('message-input').focus();

});

document.getElementById('send-button').addEventListener('click', () => {
  const text = document.getElementById('message-input').value;
  // Certifique-se de enviar o roomID junto com a mensagem
  socket.emit('message', { roomID, message: { text, userID, username: localStorage.getItem('username') } });
  document.getElementById('message-input').value = '';
});