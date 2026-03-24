const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

let latestNotification = {
  id: 0,
  message: "Server started. Waiting for updates...",
  time: new Date().toLocaleTimeString()
};

app.get("/poll", (req, res) => {
  res.json(latestNotification);
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({
    type: "notification",
    data: latestNotification
  }));

  ws.on("close", () => {
    console.log("A WebSocket client disconnected.");
  });
});

setInterval(() => {
  const nextId = latestNotification.id + 1;
  latestNotification = {
    id: nextId,
    message: `New server update #${nextId}`,
    time: new Date().toLocaleTimeString()
  };

  console.log("Generated update:", latestNotification);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "notification",
        data: latestNotification
      }));
    }
  });
}, 5000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
