const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const roomUsers = document.getElementById('users');
const usernameSpan = document.getElementById('username-text');

/* Get Username & Room from URL */
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

/* Join Chatroom */
socket.emit('joinroom', { username, room });

/* Get room and users */
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  /* Scroll Down */
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

/* Message Submit */
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value.trim();

  /* Emit message text to server */
  socket.emit('chatMessage', msg);

  /* Clear Input */
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

/* Output message to DOM */
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                   <p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputRoomUsers(users) {
  roomUsers.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

document.getElementById('leave-btn').addEventListener('click', ()=>{
  window.location = '../index.html';
});