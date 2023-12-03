const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

/* Set Static Folder */
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord'

/* Run whena client connects */
io.on('connection', socket=>{
    socket.on('joinroom', ({ username, room })=>{
        const user = userJoin(socket.id ,username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName,'Welcome to chatcord...'));

        /* Broadcast when a user connects */
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    /* Listen for chat message */
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    /* Runs when a user disconnects */
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} left the chat`));
        }   
        
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 5000

server.listen(PORT, ()=>{
    console.log(`Server Running On Port ${PORT}`);
});