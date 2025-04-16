document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.getElementById('messages');
  const userInput = document.getElementById('user');
  const messageInput = document.getElementById('message');
  const typingNotification = document.getElementById('typing-notification');
  
  // Random color for user
  const userColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  
  // Focus on message input
  messageInput.focus();
  
  // Message from server
  socket.on('chat message', (msg) => {
    outputMessage(msg);
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Clear typing notification
    typingNotification.textContent = '';
  });
  
  // Initial messages
  socket.on('init', (messages) => {
    messages.forEach(msg => outputMessage(msg));
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  
  // User typing
  messageInput.addEventListener('input', () => {
    if (userInput.value) {
      socket.emit('typing', userInput.value);
    }
  });
  
  socket.on('typing', (user) => {
    typingNotification.textContent = `${user} is typing...`;
    
    // Clear after 3 seconds
    setTimeout(() => {
      typingNotification.textContent = '';
    }, 3000);
  });
  
  // Message submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = userInput.value;
    const message = messageInput.value;
    
    if (user && message) {
      // Emit message to server
      socket.emit('chat message', { 
        user, 
        message,
        color: userColor
      });
      
      // Clear input
      messageInput.value = '';
      messageInput.focus();
    }
  });
  
  // Output message to DOM
  function outputMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    const meta = document.createElement('div');
    meta.classList.add('meta');
    meta.innerHTML = `
      <span style="color: ${msg.color}">${msg.user}</span>
      <span class="time">${formatTime(msg.timestamp)}</span>
    `;
    
    const text = document.createElement('div');
    text.classList.add('text');
    text.textContent = msg.message;
    
    div.appendChild(meta);
    div.appendChild(text);
    
    chatMessages.appendChild(div);
  }
  
  // Format time
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
});
