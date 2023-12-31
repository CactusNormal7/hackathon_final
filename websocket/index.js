const express = require('express')
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const { getCurrentUser, userJoin, userLeave, getRoomUsers } = require("./users")
const { generateUniqueRandomNumbers } = require('./utils')



app.use(cors())

const server = http.createServer(app)
const roomSettings = {};

const io = new Server(server, {
    cors: {
        origin: ["https://hackathon-final-git-main-cactusnormal7.vercel.app", "http://localhost:3000" , "https://hackathon-api-fiq7.onrender.com"],
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    socket.on('join_room', (data) => {

        const user = userJoin(socket.id, data.username, data.room)

        socket.join(user.room)
        socket.broadcast.to(user.room).emit('console_message', `${user.username} has joined the ${user.room} room`)

        //send all users infos
        io.to(user.room).emit('users_infos', { room: user.room, users: getRoomUsers(user.room) })
        console.log(getRoomUsers(user.room));
        if (roomSettings[data.room]) {
            socket.emit('settings_updated', roomSettings[data.room]);
        }
    })

    socket.on('answer_message', (data) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('answer_message_received', { username: user.username, message: data.message , score : data.score})
    })

    socket.on("on_start", async () => {
        const user = getCurrentUser(socket.id);
        const gameMode = roomSettings[user.room]?.gameMode || "mp3"; // default to mp3
    
        let dataToSend = [];
    
        switch (gameMode) {
            case "mp3":
                const da = await fetch('https://hackathon-api-fiq7.onrender.com/api/getall');
                const songs = await da.json();
                let rdnb = generateUniqueRandomNumbers(20, 1, 30);
                for (let i = 0; i < rdnb.length; i++) {
                    dataToSend.push(songs[rdnb[i]]);
                }
                break;
            case "qcm":
                dataToSend = qcmData.questions; // Utilisez directement les données QCM
                break;
            // ... handle other game modes
        }
    
        io.to(user.room).emit('game_started', dataToSend);
    });
    

    socket.on('chat_message', (data) => {
        const user = getCurrentUser(socket.id);
    
        if (!user) {
            console.error('User not found for socket ID:', socket.id);
            return;
        }
    
        io.to(user.room).emit('chat_message_received', { user: user.username, message: data.message });
    });
    

    socket.on("good_answer", (d) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit("send_score", {username :d.username ,score : d.score})
    })

    socket.on("disconnect", () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit('console_message', `${user.username} left the chat`)

            io.to(user.room).emit('users_infos', { room: user.room, users: getRoomUsers(user.room) })
        }
    })

    socket.on('update_settings', (data) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    console.log("Received settings on server:", data);
    roomSettings[user.room] = data;    
    io.to(user.room).emit('settings_updated', data);
});

    
})





const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log("SERVER IS RUNNING");
})