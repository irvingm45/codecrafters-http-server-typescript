import * as net from "net";
import { readFile } from "fs/promises";
import { loadEnvFile } from "process";
import { readFileSync } from "fs";
import { Command } from "commander";

// For reading flags
const flags = new Command();
flags
  .option("-d, --directory <string>", "For directories", "")
  .parse();

const options = flags.opts();

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
    if (e === "") {
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

// Function to print elements of the request
function printRequest(req: httpRequest) {
  console.log("Print of the request:");
  console.log(req.httpMethod + "\n" + req.requestTarget + "\n" + req.httpVersion);
  if (req.headers !== undefined) {
    for (const [key, value] of Object.entries(req.headers)) {
      console.log(key + ": " + value);
    }
  }
  console.log("");

  console.log(req.body);
}

// Function por parse the data to the response
function parseRes(req: httpRequest): httpResponse {
  let sL = req.httpVersion; // We first set the httpVersion

  let target: string[] = req.requestTarget.split("/", 3); // We split the request Target
  let endpoint = target[1] ?? ""; // A variable to handle the endpoint easier

  let headersRes: Record<string, string> = {};
  let bodyRes: string = "";

  if (target.length === 1 || req.requestTarget === "/") {
    sL += " 200 OK";
  }
  else if (endpoint === "echo") {
    sL += " 200 OK";
    // We add the headers
    headersRes["Content-Type"] = "text/plain";
    bodyRes = target[2] ?? "";
    headersRes["Content-Length"] = bodyRes.length.toString();
  }
  else if (endpoint === "user-agent"){
    sL += " 200 OK";
    // We add the headers
    headersRes["Content-Type"] = "text/plain";
    bodyRes = req.headers?.["User-Agent"] ?? "";
    headersRes["Content-Length"] = bodyRes.length.toString();
  }
  else if (endpoint === "files") {
    sL += " 200 OK";
    const filePath = options.directory + target[2];
    console.log(filePath);


    try {
      bodyRes = readFileSync(filePath, "utf-8");
      headersRes["Content-Type"] = "application/octet-stream";
      headersRes["Content-Length"] = bodyRes.length.toString();
    }
    catch (e: any) {
      console.log("File path doesn't exists: " + filePath);
      sL = "HTTP/1.1 404 Not Found"
    }
  }
  else {
    sL = "HTTP/1.1 404 Not Found";
  }

  return {
    statusLine: sL,
    headers: headersRes,
    body: bodyRes,
  };
}

// Print elements of the response and also returns the string to write on the socket
function printResponse(ans: httpResponse): string {
  let write: string = ans.statusLine + "\r\n";
  console.log(ans.statusLine);

  if (ans.headers !== undefined) {
    for (const [key, value] of Object.entries(ans.headers)) {
      console.log(key + ": " + value);
      write += key + ": " + value + "\r\n";
    }
  }

  write += "\r\n";
  write += (ans.body !== undefined) ? ans.body : "";
  console.log("\r\n" + (ans.body ?? ""));

  return write;
}

const server = net.createServer((socket) => {
  console.log("User connected");
  // When user send information through the socket
  socket.on("data", (data) => {
    // We parse the data
    const rawData = data.toString();
    const dataSplitted: string[] = rawData.split("\r\n");

    // We parse the data to the request
    const req: httpRequest = parseData(dataSplitted);
    printRequest(req);
    // Now We can create the answer
    const ans: httpResponse = parseRes(req);

    // Print of the response
    const res = printResponse(ans);

    socket.write(res);
  });

  // This event listens
  socket.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server listening on 4221");
});
