import * as express from "express";
import * as ws from "ws";

const PORT = 4000;

const wssPublish = new ws.Server({ noServer: true });
const wssSubscribe = new ws.Server({ noServer: true });

let subscribers = [];

wssSubscribe.on("connection", (socket) => {
  subscribers.push(socket);
  socket.on("close", () => {
    subscribers.splice(subscribers.indexOf(socket), 1);
  });
});

wssPublish.on("connection", (socket) => {
  socket.on("message", (message) => {
    for (const subscriber of subscribers) {
      subscriber.send(message);
    }
  });
});

const app = express();
["/", "/screen"].forEach((r) => {
  app.use(r, express.static("../client/dist"));
});
app.listen(PORT).on("upgrade", (request, socket, head) => {
  if (request.url == "/sub") {
    wssSubscribe.handleUpgrade(request, socket, head, (socket) => {
      wssSubscribe.emit("connection", socket, request);
    });
  } else if (request.url == "/pub") {
    wssPublish.handleUpgrade(request, socket, head, (socket) => {
      wssPublish.emit("connection", socket, request);
    });
  }
});
console.log("listening on port " + PORT);
