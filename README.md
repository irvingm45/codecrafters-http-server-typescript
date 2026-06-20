[![progress-banner](https://backend.codecrafters.io/progress/http-server/203cc7cf-9be8-4ef4-a7c6-7d792ceae4f6)](https://app.codecrafters.io/users/irvingm45?r=2qF)

# HTTP Server en TypeScript

Este proyecto es una implementación de un servidor HTTP/1.1 construido desde cero como parte del desafío ["Build Your Own HTTP server"](https://app.codecrafters.io/courses/http-server/overview) de [CodeCrafters](https://codecrafters.io). El servidor es capaz de atender múltiples clientes sobre TCP y responde a diferentes rutas y métodos HTTP.

## Stack tecnológico

- **TypeScript**: lenguaje principal.
- **Bun**: runtime y gestor de paquetes (versión 1.3 o superior recomendada).
- **`node:net`**: módulo de red de Node.js para crear el servidor TCP.
- **Commander.js**: parseo de argumentos de línea de comandos (por ejemplo, `--directory`).
- **pako**: compresión `gzip` para respuestas cuando el cliente lo solicita.

## Características

- Servidor HTTP/1.1 sobre TCP en el puerto `4221`.
- Soporte para los métodos `GET` y `POST`.
- Rutas implementadas:
  - `GET /` — responde con `200 OK`.
  - `GET /echo/<mensaje>` — devuelve el mensaje recibido.
  - `GET /user-agent` — devuelde el valor del header `User-Agent`.
  - `GET /files/<nombre>` — lee y devuelve un archivo desde el directorio configurado.
  - `POST /files/<nombre>` — crea un archivo en el directorio configurado con el cuerpo de la petición.
- Compresión `gzip` automática cuando el cliente envía `Accept-Encoding: gzip`.
- Manejo del header `Connection: close`.

## Uso

### Requisitos

- Tener instalado [Bun](https://bun.sh) (versión 1.3 o superior).

### Ejecutar en local

```sh
bun run app/main.ts
```

O usando el script del proyecto:

```sh
./your_program.sh
```

Por defecto el servidor escucha en `localhost:4221`.

### Especificar un directorio para archivos

Para que los endpoints `/files` funcionen, indica el directorio base con la bandera `--directory`:

```sh
bun run app/main.ts --directory /tmp/data
```

### Probar el servidor

```sh
# Ping
 curl http://localhost:4221/

# Echo
 curl http://localhost:4221/echo/hola

# User-Agent
 curl -H "User-Agent: mi-cliente" http://localhost:4221/user-agent

# Crear un archivo
 curl -X POST -d "contenido del archivo" http://localhost:4221/files/ejemplo.txt

# Leer un archivo
 curl http://localhost:4221/files/ejemplo.txt
```

## Enviar la solución a CodeCrafters

```sh
codecrafters submit
```

El resultado de las pruebas se mostrará en la terminal.

## Estructura del proyecto

```
.
├── app/
│   └── main.ts          # Punto de entrada del servidor HTTP
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración de TypeScript
├── your_program.sh      # Script para ejecutar el servidor
└── README.md            # Este archivo
```

## Notas

- Si estás viendo este repositorio en GitHub, puedes probar el desafío directamente en [codecrafters.io](https://codecrafters.io).
