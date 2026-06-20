import * as net from "net";
import { readFileSync, writeFileSync } from "fs";
import { Command } from "commander";
import { buffer } from "stream/consumers";
import pako from "pako";
import path from "path";

// For reading flags
const flags = new Command();
flags
  .option("-d, --directory <string>", "For directories", "")
  .parse();

const options = flags.opts();

// Main interface for http request
interface HttpRequest {
  httpMethod: string;
  requestTarget: string;
  httpVersion: string;

  // Record is a type that represents an object with string keys and string values similar to map in other languages
  headers?: Record<string, string>;
  body?: string;
}

// Interface for http response
interface HttpResponse {
  statusLine: string;
  headers?: Record<string, string>;
  body?: string | Buffer | Uint8Array;
}

// We parse the data to the HttpRequest
const parseRequest = (data: string[]): HttpRequest => {
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

  const bodyFound = data.slice(i).join("\r\n"); // We join the remaining lines to get the body
  // This loop can have issues if the body contains \r\n, so it's better to just join the remaining lines instead of concatenating them one by one
  // let bodyFound: string = "";
  // for (i; i < data.length; i++)
  //   bodyFound += data[i];

  return {
    httpMethod: reqLineElem[0],
    requestTarget: reqLineElem[1],
    httpVersion: reqLineElem[2],

    headers: headersFound,
    body: bodyFound,
  };
}

// Function to print elements of the request
function printRequest(req: HttpRequest) {
  console.log("Print of the request:");
  console.log(`${req.httpMethod}\n${req.requestTarget}\n${req.httpVersion}`);
  if (req.headers !== undefined) {
    for (const [key, value] of Object.entries(req.headers)) {
      console.log(key + ": " + value);
    }
  }
  console.log("");

  console.log(req.body);
}

// To split the path and get the endpoint
const parseTarget = (requestTarget: string) => {
  const parts = requestTarget.split("/", 3);
  return {
    endpoint: parts[1] ?? "",
    target: parts[2] ?? "",
  }
}

// To add content Encoding
const contentEncoding = (encodings?: string): string => {
  if (!encodings) return "";

  const encodingsOpts = encodings.split(",").map(e => e.trim()); // We split the encodings and remove spaces
  const collection: string[] = ["gzip"];

  return encodingsOpts
    .filter(e => collection.includes(e))
    .join(", ");
}

const buildResponse = (
  statusLine: string,
  body: string | Buffer | Uint8Array = "",
  contentType: string = "",
  headersReq: Record<string, string> = {}
): HttpResponse => {
  let headers: Record<string, string> = {};

  // Addition of content encoding
  const encoding = contentEncoding(headersReq?.["Accept-Encoding"] ?? "");
  if (encoding) {
    if (encoding.includes("gzip")) {
      headers["Content-Encoding"] = "gzip";
      // We now compress the body in gzip
      body = pako.gzip(body);
    }
  }

  if (contentType) {
    headers["Content-Type"] = contentType;
    headers["Content-Length"] = body.length.toString();
  }

  return { statusLine, headers, body };
}

function getMethod(req: HttpRequest): HttpResponse {
  const { endpoint, target } = parseTarget(req.requestTarget);

  // Just a 200 OK if the target is empty or just "/"
  if (endpoint === "" || req.requestTarget === "/")
    return buildResponse(`${req.httpVersion} 200 OK`);
  // If the endpoint is echo, we return the target as body (because echo repeats what is sended)
  if (endpoint === "echo")
    return buildResponse(`${req.httpVersion} 200 OK`, target, "text/plain", req.headers);
  // User-agent just returns the value of User-Agent header
  if (endpoint === "user-agent") {
    const bodyRes = req.headers?.["User-Agent"] ?? "";
    return buildResponse(`${req.httpVersion} 200 OK`, bodyRes, "text/plain", req.headers);
  }
  // Returns the data of the file
  else if (endpoint === "files") {
    // We look fot the directory flag an it's value
    // const filePath: string = options.directory + target[2];
    const filePath: string = path.join(options.directory, target); // It's better to use path.join to avoid issues with different operating systems
    console.log(filePath);

    try {
      const bodyRes = readFileSync(filePath, "utf-8"); // We read the content of the file
      return buildResponse(`${req.httpVersion} 200 OK`, bodyRes, "application/octet-stream", req.headers);
    }
    // In case the file path doesn't exists
    catch (e: any) {
      console.log("File path doesn't exists: " + filePath);
      return buildResponse(`${req.httpVersion} 404 Not Found`);
    }
  }

  // In case the endpoint is not recognized or the file doesn't exists, we return a 404 Not Found
  return buildResponse(`${req.httpVersion} 404 Not Found`);
}

function postMethod(req: HttpRequest): HttpResponse {
  const { endpoint, target } = parseTarget(req.requestTarget);

  if (endpoint === "files") {
    // We look for the directory flag an it's value
    // const filePath = options.directory + target;
    const filePath = path.join(options.directory, target);
    console.log(filePath);

    try {
      // We write the content on the file
      writeFileSync(filePath, req.body ?? "", "utf-8");
      return buildResponse(`${req.httpVersion} 201 Created`, req.body ?? "", "application/octet-stream", req.headers);
    }
    // In case the file path doesn't exists
    catch (e: any) {
      console.log("File path doesn't exists: " + filePath);
      return buildResponse(`${req.httpVersion} 404 Not Found`);
    }
  }
  return buildResponse(`${req.httpVersion} 404 Not Found`);
}

// Function por parse the data to the response
function parseResponse(req: HttpRequest): HttpResponse {
  if (req.httpMethod === "GET") {
    return getMethod(req);
  }
  else if (req.httpMethod === "POST") {
    return postMethod(req);
  }

  return buildResponse(`${req.httpVersion} 405 Method Not Allowed`);
}

// Print elements of the response and also returns the string to write on the socket
function printResponse(ans: HttpResponse): string {
  let write = ans.statusLine + "\r\n";
  console.log(ans.statusLine);

  if (ans.headers !== undefined) {
    for (const [key, value] of Object.entries(ans.headers)) {
      console.log(key + ": " + value);
      write += key + ": " + value + "\r\n";
    }
  }

  write += "\r\n";
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
    const req: HttpRequest = parseRequest(dataSplitted);
    printRequest(req);

    // Now We can create the answer
    const ans: HttpResponse = parseResponse(req);

    // Print of the response
    const header = printResponse(ans);

    socket.write(header);
    if (ans.body !== undefined) {
      console.log(ans.body);
      socket.write(ans.body);
    }
  });

  // This event listens
  socket.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server listening on 4221");
});
