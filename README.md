# puppeteer-server

A service that will handle puppeteer related tasks to offload the burden from LDS

---

- [puppeteer-server](#puppeteer-server)
  - [Installation](#installation)
    - [Development Mode](#development-mode)
    - [Build Mode](#development-mode)

## Installation

### Development Mode

Run `docker-compose up` to start development mode

### Build Mode

1. Build the image with `docker build -t puppeteer-service:1.0 .`
2. Run `docker run --env-file ./.env puppeteer-service:1.0`
