import { EmojiButton } from 'https://unpkg.com/@joeattardi/emoji-button@latest';

// Conectar ao WebSocket
const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const channelId = urlParams.get('channelId');


const emojiButton = document.querySelector('#emoji-button');
    const picker = new EmojiButton();

    
    picker.on('emoji', emojiObject => {
        const emojiString = emojiObject.emoji; 
        document.querySelector('#message-input').value += emojiString;
    });

  emojiButton.addEventListener('click', () => picker.togglePicker(emojiButton));


document.addEventListener('DOMContentLoaded', function() {
    // Extrair channelId da URL
    const userID = localStorage.getItem('userID');
    const username = localStorage.getItem('username');

    if (!channelId) {
        console.error('Channel ID is missing in the URL');
        return;
    }

    const messagesContainer = document.getElementById('messages-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    
    socket.emit('joinChannel', {channelId});

    
    socket.on('history-channel', (messages) => {
        
        messagesContainer.innerHTML = ''; // Limpa as mensagens existentes antes de carregar o histórico
      
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
          } else if (message.type === 'image') {
            const imageElement = document.createElement('img');
            imageElement.classList.add('message-file');
            imageElement.alt = 'Image';
            imageElement.src = message.image;
            messageContent.appendChild(imageElement);
            
          } else if (message.type === 'video') {
            const videoElement = document.createElement('video');
            videoElement.classList.add('message-file');
            videoElement.alt = 'Video';
            videoElement.src = message.video;
            videoElement.controls = true;
            messageContent.appendChild(videoElement);
            
          } else {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = createLinkElement(message.text);
            messageContent.appendChild(textDiv);
          }
          
      
          li.appendChild(messageContent);
          messagesContainer.appendChild(li);
        });
      
        // Após carregar o histórico, mova o foco para o campo de entrada de mensagem
        document.getElementById('message-input').focus();
      });


      socket.on('channel-message', (message) => {
        
        
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

        } else if (message.type === 'image') {
          const imageElement = document.createElement('img');
          imageElement.classList.add('message-file');
          imageElement.alt = 'Image';
          imageElement.src = message.image;
          messageContent.appendChild(imageElement);
          
        } else if (message.type === 'video') {
          const videoElement = document.createElement('video');
          videoElement.classList.add('message-file');
          videoElement.src = message.video;
          videoElement.alt = 'Video';
          videoElement.controls = true;
          messageContent.appendChild(videoElement);
          
        } else {
          const textDiv = document.createElement('div');
          textDiv.innerHTML = createLinkElement(message.text);
          messageContent.appendChild(textDiv);
        }

        li.appendChild(messageContent);
        messagesContainer.appendChild(li);
      
        // // Após carregar o histórico, mova o foco para o campo de entrada de mensagem
         document.getElementById('message-input').focus();
      
      });


      messageForm.addEventListener('submit', function(e) {
             e.preventDefault();
            const messageText = messageInput.value.trim();
            const file = document.getElementById('file-input').files[0];

            if (messageText) {

                socket.emit('channel-message', {
                    channelId,
                    message: {
                        username: username, // Substitua por um método para obter o nome de usuário atual
                        text: messageText,
                    }
                });
                messageInput.value = ''; // Limpa o campo de input após enviar

              } else if (file) {
                // Se houver um arquivo, você precisa fazer upload para um servidor ou serviço de armazenamento de arquivos
                // Depois de fazer upload do arquivo e obter a URL, você pode enviar essa URL como uma mensagem
                uploadFile(file).then(response => {
                    const url = response.url;
                    socket.emit('channel-message', {
                      channelId,
                      message: {
                          username: username, // Substitua por um método para obter o nome de usuário atual
                          file: url,
                          type: file.type.startsWith('image/') ? 'image' : 'video'
                      }
                    });
                    messageInput.value = '';
                    document.getElementById('file-input').value = ''; // Limpar o campo de arquivo
                }).catch(error => {
                    console.error('Falha ao enviar arquivo', error);
                });
            }
        });



        // Função para verificar se a mensagem contém um link e transformá-lo em um elemento clicável
    function createLinkElement(text) {
      // Regex para identificar URLs na mensagem
      const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      // Substitui todas as ocorrências de URLs por um elemento âncora
      return text.replace(urlRegex, function(url) {
          return `<a href="${url}" target="_blank">${url}</a>`;
      });
  }
  
  
        //////////////////////////// upload file ////////////////////////////
        //////////////////////////// upload file ////////////////////////////
        //////////////////////////// upload file ////////////////////////////

      // Função para fazer upload de arquivos
    async function uploadFile(file) {

      if(file.size > 20 * 1024 * 1024) { // Se o arquivo for maior que 20 MB
          alert('O arquivo é muito grande. O tamanho máximo permitido é de 20 MB.');
          return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/upload', {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          throw new Error('Falha ao fazer upload do arquivo');
      }

      return response.json();
  }


        //////////////////////////// Channel GIF ////////////////////////////
        //////////////////////////// Channel GIF ////////////////////////////
        //////////////////////////// Channel GIF ////////////////////////////

// Função para enviar a mensagem com o GIF
function sendGifMessageChannel(gifUrl) {
  socket.emit('channel-message', {
    channelId,
    message: {
      text: gifUrl,
      userID,
      username: localStorage.getItem('username'),
      type: 'gif'
    }
  });
  // Limpa a busca e os resultados do GIF após o envio
  gifSearchInputChannel.value = '';
  gifSearchResults.innerHTML = '';
}

const gifModal = document.getElementById('gif-modal');
const gifSearchInputChannel = document.getElementById('gif-search-input-channel');
const gifSearchResults = document.getElementById('gif-search-results');
const closeModal = document.getElementById('close-modal');


// Abre o modal
document.getElementById('gif-button').addEventListener('click', () => {

  gifModal.style.display = 'block';
  gifSearchInputChannel.focus();
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
gifSearchInputChannel.addEventListener('input', () => {
  const searchTerm = gifSearchInputChannel.value;
  if (searchTerm.length > 2) { // Evita buscar por strings muito curtas
      searchGifsChannel(searchTerm);
  } else {
    gifSearchResults.innerHTML = ''; // Limpa resultados se a busca for muito curta
  }
});


  //função para lidar com a busca de GIFs
  async function searchGifsChannel(query) {
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
          sendGifMessageChannel(gif.images.fixed_height.url);
          gifModal.style.display = "none"; // Fecha o modal após a seleção
        });
        gifSearchResults.appendChild(img);
      });
  
    } catch (error) {
      console.error('Erro ao buscar GIFs:', error);
    }
  }

});
