import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const okResponse = "HTTP/1.1 200 OK\r\n\r\n";
const server = net.createServer((socket) => {
  console.log("User connected");

  // When user send information through the socket
  socket.on("data", (data) => {
    socket.write(okResponse);
  });

  // This event listens
  socket.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server listening on 4221");
});
