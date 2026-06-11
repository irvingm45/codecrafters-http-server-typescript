import * as net from "net";

// Main interface for http request
interface httpRequest {
  httpMethod: string;
  requestTarget: string;
  httpVersion: string;

  // Record is a type that represents an object with string keys and string values similar to map in other languages
  headers?: Record<string, string>;
  body?: string;
}

// Interface for http response
interface httpResponse {
  statusLine: string;
  headers?: Record<string, string>;
  body?: string;
}

// We parse the data to the httpRequest
const parseData = (data: string[]): httpRequest => {
  // First we verify the method
  const reqLineElem: string[] = data[0].split(" ");

  // Handle headers
  console.log("Headers:");

  let i = 1;
  let headersFound: Record<string, string> = {};
  for (const e of data.slice(1)) {
    if (e === "\r\n") {
      i++;
      break; // End of headers
    }

    // We save each header
    const [key, value] = e.split(": ");
    console.log(`${key}: ${value}`);
    headersFound[key] = value;
    i++;
  }

  let bodyFound: string = "";
  for (i; i < data.length; i++)
    bodyFound += data[i];

  return {
    httpMethod: reqLineElem[0],
    requestTarget: reqLineElem[1],
    httpVersion: reqLineElem[2],

    headers: headersFound,
    body: bodyFound,
  };
}

function parseRes(req: httpRequest): httpResponse {
  let sL = req.httpVersion;
  let target: string[] = req.requestTarget.split("/");

  let headersRes: Record<string, string> = {};
  let bodyRes: string = "";
  if (target.length === 1 || req.requestTarget === "/") {
    sL += " 200 OK";
  }
  else if (target[1] === "echo") {
    sL += " 200 OK";
    headersRes["Content-Type"] = "text/plain";
    headersRes["Content-Length"] = target[2].length.toString();
    bodyRes = target[2];
  }
  else {
    sL = "HTTP/1.1 404 Not Found\r\n\r\n";
  }

  return {
    statusLine: sL,
    headers: headersRes,
    body: bodyRes,
  }
}

const okResponse = "HTTP/1.1 200 OK\r\n";
const server = net.createServer((socket) => {
  console.log("User connected");

  // When user send information through the socket
  socket.on("data", (data) => {
    // We parse the data
    const rawData = data.toString();
    const dataSplitted: string[] = rawData.split("\r\n");

    // We parse the data to the request
    const req: httpRequest = parseData(dataSplitted);

    // Now We can create the answer
    const ans: httpResponse = parseRes(req);

    // Print of the response
    let write: string = ans.statusLine + "\r\n";
    console.log(ans.statusLine + "\r\n");
    if (ans.headers !== undefined) {
      for (const [key, value] of Object.entries(ans.headers)) {
        console.log(key + ": " + value + "\r\n");
        write += key + ": " + value + "\r\n";
      }
    }

    write += "\r\n";
    write += (ans.body !== undefined) ? ans.body : "";
    console.log("\r\n" + (ans.body !== undefined) ? ans.body : "");

    socket.write(write);
  });

  // This event listens
  socket.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server listening on 4221");
});
