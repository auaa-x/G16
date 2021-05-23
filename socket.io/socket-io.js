exports.init = function(io) {
    const chat= io
        .of('/chat')
        .on('connection', function (socket) {
            try {
                /**
                 * it creates or joins a room
                 */
                socket.on('create or join', function (roomId, userId, roomNo) {
                    socket.join(roomId);
                    chat.to(roomId).emit('joined', roomId, userId, roomNo);
                });

                socket.on('chat', function (roomId, userId, chatText) {
                    chat.to(roomId).emit('chat', roomId, userId, chatText);
                });

                socket.on('disconnect', function(){
                    console.log('someone disconnected');
                });
                socket.on('drawing', (roomId, userId, width, height, prevX, prevY, currX, currY, color, thickness) => {
                    chat.to(roomId).emit('drawing', roomId, userId, width, height, prevX, prevY, currX, currY, color, thickness);
                });
                socket.on('clear canvas', (roomId, userId) => {
                    chat.in(roomId).emit('clear canvas', roomId, userId);
                })
            } catch (e) {
            }
        });
}
