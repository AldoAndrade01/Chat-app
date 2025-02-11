const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const PORT = process.env.PORT || 8000;
const list_users = {};

const { saveMessage, getMessages } = require("./database");

app.use(express.static(path.join(__dirname, "views")));

server.listen(PORT, () => {
  console.log(
    "-+-+-+-+- Servidor iniciado -+-+-+-+-+-\n" +
      " -+-+-+- http://127.0.0.1:" +
      PORT +
      " -+-+-+-"
  );
});

io.on("connection", (socket) => {
    console.log("🔌 Un usuario se ha conectado");

    // Enviar mensajes almacenados al conectar
    getMessages((messages) => {
        socket.emit("loadMessages", messages);
    });

    // Registrar usuario
    socket.on("register", (nickname) => {
        if (list_users[nickname]) {
            socket.emit("userExists");
            return;
        } else {
            list_users[nickname] = socket.id;
            socket.nickname = nickname;
            socket.emit("login");
            io.emit("activeSessions", list_users);
        }
    });

    // Manejo de desconexión
    socket.on("disconnect", () => {
        delete list_users[socket.nickname];
        io.emit("activeSessions", list_users);
    });

    // Guardar y reenviar mensajes nuevos (Corrección: Evita mensajes duplicados)
    socket.on("sendMessage", ({ message, image }) => {
        saveMessage(socket.nickname, message, image);
        io.emit("sendMessage", { message, user: socket.nickname, image });
    });

    // Envío de mensajes privados
    socket.on("sendMessagesPrivate", ({ message, image, selectUser }) => {
        if (list_users[selectUser]) {
            io.to(list_users[selectUser]).emit("sendMessage", {
                message,
                user: socket.nickname,
                image,
            });
            io.to(list_users[socket.nickname]).emit("sendMessage", {
                message,
                user: socket.nickname,
                image,
            });
        } else {
            socket.emit("errorMessage", "El usuario al que intentas enviar el mensaje no existe.");
        }
    });
});
