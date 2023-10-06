import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:3001";
const socket = socketIOClient(ENDPOINT);

function Chat({ pseudo }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (pseudo) {
      socket.emit("set_pseudo", pseudo);
    }

    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [pseudo]);

  const handleSendMessage = () => {
    if (input.trim()) {
      socket.emit("send_message", input);
      setInput("");
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chatWrapper">
      <div className="test">
        <h1>Real-time Chat</h1>
      </div>
      <div className="chatContainer" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className="chatContent">
            <strong>{message.pseudo}:</strong> {message.content}
          </div>
        ))}
      </div>
      <div className="chatInput">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleInputKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;