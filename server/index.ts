import * as express from "express";
import * as ws from "ws";

const PORT = 4000;

const app = express();

const wssClient = new ws.Server({ noServer: true });
const wssBigScreen = new ws.Server({ noServer: true });

let globalConnections = [];

wssBigScreen.on("connection", (socket) => {
  globalConnections.push(socket);
  socket.on("close", () => {
    globalConnections.splice(globalConnections.indexOf(socket), 1);
  });
});

wssClient.on("connection", (socket) => {
  socket.on("message", (message) => {
    console.log(message.toString());
    for (const globalConnection of globalConnections) {
      globalConnection.send(message);
    }
  });
});

app.get("/bigscreen", (_req, res) => {
  res.set("Content-Security-Policy", "default-src 'self'");
  res.send("send me stuff");
});

app.get("/", (_req, res) => {
  res.set("Content-Security-Policy", "default-src 'self'");
  res.send("i iz client");
});

const server = app.listen(PORT);
console.log("Listening on " + PORT);
server.on("upgrade", (request, socket, head) => {
  if (request.url == "/bigscreen") {
    wssBigScreen.handleUpgrade(request, socket, head, (socket) => {
      wssBigScreen.emit("connection", socket, request);
    });
  } else if (request.url == "/") {
    wssClient.handleUpgrade(request, socket, head, (socket) => {
      wssClient.emit("connection", socket, request);
    });
  }
});
