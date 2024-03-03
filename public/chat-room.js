const socket = io();
const roomID = new URLSearchParams(window.location.search).get('roomId');
const userID = localStorage.getItem('userID');

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
    
    // Formatar a data para o formato "dia/mês/ano hora:minuto"
    const date = new Date(message.timestamp);
    timestampSpan.innerText = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const textDiv = document.createElement('div');
    textDiv.innerText = message.text;

    messageContent.appendChild(usernameSpan);
    messageContent.appendChild(timestampSpan);
    messageContent.appendChild(textDiv);

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

  const textDiv = document.createElement('div');
  textDiv.innerText = message.text;

  messageContent.appendChild(usernameSpan);
  messageContent.appendChild(timestampSpan);
  messageContent.appendChild(textDiv);

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