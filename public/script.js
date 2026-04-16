const socket = io();

const editor = document.getElementById('editor');
const statusBadge = document.getElementById('status');
const typingIndicator = document.getElementById('typing-indicator');

let isRemoteUpdate = false;
let typingTimeout;
let debounceTimeout;

// Connection status
socket.on('connect', () => {
    statusBadge.textContent = 'Connected';
    statusBadge.classList.add('connected');
});

socket.on('disconnect', () => {
    statusBadge.textContent = 'Disconnected';
    statusBadge.classList.remove('connected');
});

// Initial content
socket.on('init-content', (content) => {
    isRemoteUpdate = true;
    editor.value = content;
    isRemoteUpdate = false;
});

// Remote updates
socket.on('content-update', (content) => {
    isRemoteUpdate = true;
    
    // Save cursor position
    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;

    editor.value = content;

    // Restore cursor position to prevent jumping
    // (Note: This is a basic implementation that works well for simple edits)
    editor.setSelectionRange(selectionStart, selectionEnd);
    
    isRemoteUpdate = false;
});

// Typing indicator from others
socket.on('typing', (data) => {
    if (data.isTyping) {
        typingIndicator.textContent = `User ${data.userId} is typing...`;
    } else {
        typingIndicator.textContent = '';
    }
});

// Local changes with basic debounce
editor.addEventListener('input', () => {
    if (isRemoteUpdate) return;

    // Immediate typing indicator
    socket.emit('typing', { isTyping: true });

    // Debounced content update to reduce spam
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        socket.emit('content-update', editor.value);
    }, 100); // 100ms debounce

    // Reset typing indicator after 2 seconds of inactivity
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', { isTyping: false });
    }, 2000);
});
