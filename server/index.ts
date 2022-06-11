import * as express from "express";
import * as ws from "ws";
import * as path from "path";
import { IncomingMessage } from "http";

const PORT = 4000;

const wssPublish = new ws.Server({ noServer: true });
const wssSubscribe = new ws.Server({ noServer: true });

let topics = {};

function getTopicFromURL(request: IncomingMessage) {
  return new URL(request.url, "x://x").searchParams.get("topic");
}

wssSubscribe.on("connection", (socket, request) => {
  const topic = getTopicFromURL(request);
  if (!topic) return;
  if (!topics[topic]) {
    topics[topic] = [];
  }
  const subscribers = topics[topic];
  subscribers.push(socket);
  socket.on("close", () => {
    subscribers.splice(subscribers.indexOf(socket), 1);
    if (subscribers.length == 0) {
      delete topics[topic];
    }
  });
});

wssPublish.on("connection", (socket, request) => {
  const topic = getTopicFromURL(request);
  if (!topic || !topics[topic]) return;
  const subscribers = topics[topic];
  socket.on("message", (message) => {
    for (const subscriber of subscribers) {
      subscriber.send(message);
    }
  });
});

const app = express();
app.use("*", express.static(path.join("..", "client", "dist")));
app.listen(PORT).on("upgrade", (request, socket, head) => {
  if (request.url.startsWith("/sub")) {
    wssSubscribe.handleUpgrade(request, socket, head, (socket) => {
      wssSubscribe.emit("connection", socket, request);
    });
  } else if (request.url.startsWith("/pub")) {
    wssPublish.handleUpgrade(request, socket, head, (socket) => {
      wssPublish.emit("connection", socket, request);
    });
  }
});
console.log("listening on port " + PORT);
