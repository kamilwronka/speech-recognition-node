const app = require("express")();
const server = require("http").createServer(app);
// const io = require("socket.io")(http);
const speech = require("@google-cloud/speech");

const client = new speech.v1.SpeechClient();

const config = {
  encoding: "LINEAR16",
  sampleRateHertz: 48000,
  languageCode: "pl-PL",
  interimResults: true,
  singleUtterance: false
};

const request = {
  config: config
};

const fs = require("fs");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  const recognizeStream = client
    .streamingRecognize(request)
    .on("data", data => {
      console.log(data);
      // Data event from Speech api
      console.log(JSON.stringify(data.results[0]));

      if (data.results && data.results[0]) {
        ws.send(JSON.stringify(data.results[0]));
      }
    })
    .on("error", error => {
      console.log(error);
      ws.send(
        JSON.stringify({
          error: true
        })
      );
    })
    .on("write", data => {
      console.log("dupa");
    });

  console.log("connection");

  ws.on("message", function incoming(data) {
    const buffer = new Int16Array(data, 0, Math.floor(data.byteLength / 2));

    recognizeStream.write(buffer);
  });

  ws.on("close", () => {
    console.log("end XD");
    recognizeStream.end();
  });
});

server.listen(4000, function() {
  console.log("listening on *:4000");
});
