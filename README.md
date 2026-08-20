[![progress-banner](https://backend.codecrafters.io/progress/http-server/203cc7cf-9be8-4ef4-a7c6-7d792ceae4f6)](https://app.codecrafters.io/users/irvingm45?r=2qF)

# HTTP Server in TypeScript

This project is an HTTP/1.1 server implementation built from scratch as part of the ["Build Your Own HTTP server"](https://app.codecrafters.io/courses/http-server/overview) challenge from [CodeCrafters](https://codecrafters.io). The server is able to handle multiple clients over TCP and responds to different HTTP routes and methods.

## Tech stack

- **TypeScript**: main language.
- **Bun**: runtime and package manager (version 1.3 or higher recommended).
- **`node:net`**: Node.js networking module used to create the TCP server.
- **Commander.js**: command-line argument parsing (e.g. `--directory`).
- **pako**: `gzip` compression for responses when requested by the client.

## Features

- HTTP/1.1 server over TCP on port `4221`.
- Support for `GET` and `POST` methods.
- Implemented routes:
  - `GET /` — responds with `200 OK`.
  - `GET /echo/<message>` — returns the received message.
  - `GET /user-agent` — returns the value of the `User-Agent` header.
  - `GET /files/<name>` — reads and returns a file from the configured directory.
  - `POST /files/<name>` — creates a file in the configured directory with the request body.
- Automatic `gzip` compression when the client sends `Accept-Encoding: gzip`.
- Handling of the `Connection: close` header.

## Usage

### Requirements

- [Bun](https://bun.sh) installed (version 1.3 or higher).

### Run locally

```sh
bun run app/main.ts
```

Or using the project script:

```sh
./your_program.sh
```

By default the server listens on `localhost:4221`.

### Specifying a directory for files

For the `/files` endpoints to work, specify the base directory with the `--directory` flag:

```sh
bun run app/main.ts --directory /tmp/data
```

### Testing the server

```sh
# Ping
 curl http://localhost:4221/

# Echo
 curl http://localhost:4221/echo/hello

# User-Agent
 curl -H "User-Agent: my-client" http://localhost:4221/user-agent

# Create a file
 curl -X POST -d "file content" http://localhost:4221/files/example.txt

# Read a file
 curl http://localhost:4221/files/example.txt
```

## Submitting the solution to CodeCrafters

```sh
codecrafters submit
```

The test results will be shown in the terminal.

## Project structure

```
.
├── app/
│   └── main.ts          # HTTP server entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── your_program.sh      # Script to run the server
└── README.md            # This file
```

## Notes

- If you're viewing this repository on GitHub, you can try the challenge directly at [codecrafters.io](https://codecrafters.io).
