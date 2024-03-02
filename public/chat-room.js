const socket = io();
const roomID = new URLSearchParams(window.location.search).get('roomId');
const userID = localStorage.getItem('userID');

socket.emit('joinRoom', { roomID, userID });

socket.on('history', (messages) => {
  messages.forEach((message) => {
    const li = document.createElement('li');
    li.innerText = message.text;
    document.getElementById('messages').appendChild(li);
  });
});

socket.on('message', (message) => {
  const li = document.createElement('li');
  li.innerText = message.text;
  document.getElementById('messages').appendChild(li);
});

document.getElementById('send-button').addEventListener('click', () => {
  const text = document.getElementById('message-input').value;
  // Certifique-se de enviar o roomID junto com a mensagem
  socket.emit('message', { roomID, message: { text, userID, username: localStorage.getItem('username') } });
  document.getElementById('message-input').value = '';
});