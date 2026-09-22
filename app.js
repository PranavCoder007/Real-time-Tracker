const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");

// IMPORTANT:
// Vercel serves files inside public/ automatically.
// Keep this for local development, but Vercel's own static serving
// handles the public folder.
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {

    console.log("connected:", socket.id);

    socket.on("send-location", function (data) {

        io.emit("receive-location", {
            id: socket.id,
            ...data
        });

    });

    socket.on("disconnect", function () {

        io.emit("user-disconnected", socket.id);

    });

});

app.get("/", function (req, res) {
    res.render("index");
});

// Export for Vercel
module.exports = server;