const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

mongoose.connect("mongodb://127.0.0.1:27017/chat-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);

require("./sockets/chatSocket")(io);
app.get("/", (req, res) => {
  res.send("Chat Backend API is running ");
});


const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));