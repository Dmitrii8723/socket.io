const { instrument } = require('@socket.io/admin-ui');
const io = require('socket.io')(3000, {
    cors: {
    origin: ['http://localhost:1234', 'https://admin.socket.io']
}
});

const userIo = io.of('/user');
userIo.on('connection', socket => {
    console.log('Conneted to user namespace with username', socket.username);
});

userIo.use((socket, next) => {
 if (socket.handshake.auth.token) {
   socket.username = getUsernameFromToken(socket.handshake.auth.token);
   next();
 } else {
   next(new Error('Please send token'));
 };
});

function getUsernameFromToken(token) {
    return token;
}

io.on('connection', socket => {
    console.log(socket.id);
    socket.on('send-message', (message, room) => {
        if (room === '') {
        socket.broadcast.emit('receive-message', message)
        } else {
            socket.to(room).emit('receive-message', message)
        };
    });
    socket.on('join-room', (room, callback) => {
        socket.join(room);
        callback(`Joined room ${room}`)
    });
    socket.on('ping', count => {
        console.log(count);
    })
});

instrument(io, { auth: false });