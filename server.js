const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// In-memory document storage
let documentContent = "";

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    const userId = socket.id.substring(0, 5);
    console.log(`User connected: ${userId}`);

    // Send the current document content to the new user
    socket.emit('init-content', documentContent);

    // Handle content updates
    socket.on('content-update', (content) => {
        documentContent = content;
        // Broadcast the update to everyone else
        socket.broadcast.emit('content-update', content);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {
            userId: userId,
            isTyping: data.isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        socket.broadcast.emit('typing', {
            userId: userId,
            isTyping: false
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
