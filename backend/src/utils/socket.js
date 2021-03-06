//socket io to Attendance

export const io = undefined

export async function initSocket(app, SOCKET_PORT) {
    const server = require('http').createServer(app)
    const io = require('socket.io')(server)

    //Attendance State
    var curState = {
        flag: false,
    }

    //connect event
    io.on('connection', function(socket) {
        socket.on('join', function(data) {
            socket.join(data.roomName)
        })
        //disconnect event
        socket.on('disconnect', () => {
            // console.log('[socket.io] ' + socket.id + 'user disconnected')
        })
        //attendance event lisner
        socket.on('attendance', function(data) {
            curState.flag = data.flag
            var rtnMessage = {
                flag: data.flag,
            }
            //broadcast changed state
            socket.broadcast.to('attendance').emit('attendance', rtnMessage)
        })
        //connect after attendance start
        setInterval(function() {
            if (curState.flag == true) {
                socket.to('attendance').emit('attendance', curState)
            }
        }, 1000)
    })
    //start socket.io server
    server.listen(SOCKET_PORT, function() {
        console.log(`[socket io] server listening on port ${SOCKET_PORT}`) // eslint-disable-line no-console
    })
}
