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
      
    
            const textDiv = document.createElement('div');
            textDiv.innerText = message.text;
            messageContent.appendChild(textDiv);
          
      
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
      
        
          const textDiv = document.createElement('div');
          textDiv.innerText = message.text;
          messageContent.appendChild(textDiv);

      
        li.appendChild(messageContent);
        messagesContainer.appendChild(li);
      
        // // Após carregar o histórico, mova o foco para o campo de entrada de mensagem
         document.getElementById('message-input').focus();
      
      });


      messageForm.addEventListener('submit', function(e) {
             e.preventDefault();
            const messageText = messageInput.value.trim();

            if (messageText) {
                console.log(messageText);

                socket.emit('channel-message', {
                    channelId,
                    message: {
                        username: username, // Substitua por um método para obter o nome de usuário atual
                        text: messageText,
                    }
                });
                messageInput.value = ''; // Limpa o campo de input após enviar
            }
        });

});
