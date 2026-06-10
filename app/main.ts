import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Main interface for http request
interface httpRequest {
  httpMethod: string;
  requestTarget: string;
  httpVersion: string;

  // Record is a type that represents an object with string keys and string values similar to map in other languages
  headers?: Record<string, string>;
}

const parseData = (data: string[]): httpRequest => {
  // First we verify the method
  const reqLineElem: string[] = data[0].split(" ");
  // TODO: handle headers

  return {
    httpMethod: reqLineElem[0],
    requestTarget: reqLineElem[1],
    httpVersion: reqLineElem[2],
  }
}

const okResponse = "HTTP/1.1 200 OK\r\n\r\n";
const server = net.createServer((socket) => {
  console.log("User connected");

  // When user send information through the socket
  socket.on("data", (data) => {
    // We parse the data
    const rawData = data.toString();
    const dataSplitted: string[] = rawData.split("\r\n");

    // We parse the data to the request
    const req: httpRequest = parseData(dataSplitted);
    console.log(req.requestTarget);
    if (req.requestTarget === "/")
      socket.write(okResponse);
    else
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
  });

  // This event listens
  socket.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server listening on 4221");
});
