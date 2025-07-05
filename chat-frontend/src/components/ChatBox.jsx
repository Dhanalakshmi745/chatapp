import React, { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";


function ChatBox() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

useEffect(() => {
  // 1. Load existing messages
  axios.get("http://localhost:5000/api/messages").then((res) => {
    setMessages(res.data);
  });

  // 2. Listen to new messages from socket
  const handleReceiveMessage = (data) => {
    console.log("Socket message received:", data);
    setMessages((prevMessages) => [...prevMessages, data]);
  };

  socket.on("receive_message", handleReceiveMessage);

  // 3. Clean up to prevent duplicates on re-render
  return () => {
    socket.off("receive_message", handleReceiveMessage);
  };
}, []);

useEffect(() => {
  console.log("Socket ID:", socket.id);
}, []);


const sendMessage = () => {
  const newMessage = { sender: "User", content: message };

  // 1. Immediately update local messages state for smoother UX
  setMessages((prevMessages) => [...prevMessages, newMessage]);

  // 2. Emit to all connected clients
  socket.emit("send_message", newMessage);

  // 3. Save to DB
  axios.post("http://localhost:5000/api/messages", newMessage)
    .then(() => {
      // 4. Generate bot reply after successful save
      const botReply = {
        sender: "Bot",
        content: generateReply(message),
      };

      // 5. Emit bot reply
      socket.emit("send_message", botReply);
      
       setMessages((prevMessages) => [...prevMessages, botReply]);

      // 6. Save bot reply to DB
      axios.post("http://localhost:5000/api/messages", botReply);
    });

  setMessage(""); // 7. Clear input
};

const generateReply = (msg) => {
  if (msg.toLowerCase().includes("hello")) return "Hi!How can I help you today?👋";
  if (msg.toLowerCase().includes("how are you")) return "I'm fine 😄";
  if (msg.toLowerCase().includes("internships are necessary?")) return  "Yes! where you can apply classroom knowledge to real projects and Learn how actual companies work — tools, team structure, deadlines."
  if (msg.toLowerCase().includes("Can you find me tutorials for React?")) return "You can check: reactjs.org (official)"
  return "Sorry, I don't understand that yet.";
};


  return (
   <center> <div style={{backgroundImage:"url('https://tse1.mm.bing.net/th/id/OIP.3DVLxmcR-4JG30ALGBy-8AHaEK?pid=Api&P=0&h=180')",backgroundSize: "cover", minHeight: "100vh" }}>
    <h2 style={{color:"red", backgroundColor:"lightblue"}}> Chat App </h2>
      <div style={{ 
        border: "1px solid", 
        padding: "10px", 
        height: "100vh",
        width:"100vw", 
        overflowY: "scroll",
        // backgroundColor: "black",
        marginBottom: "20px" }}>
        {messages.map((msg, index) => (
          <div key={index}><b>{msg.sender}</b>: {msg.content}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage} style={{ padding: "10px 20px", marginLeft: "10px" }} >Send</button>
    </div></center>
  );
}

export default ChatBox;