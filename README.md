# puppeteer-server

A service that will handle puppeteer related tasks to offload the burden from LDS

---

- [puppeteer-server](#puppeteer-server)
  - [Installation](#installation)
    - [Development Mode](#development-mode)
    - [Build Mode](#development-mode)
  - [Known Issues](#known-issues)
  - [TODOs](#todos)

## Installation

### Development Mode

Run `docker-compose up` to start development mode

### Build Mode

1. Build the image with `docker build -t puppeteer-service:1.0 .`
2. Run `docker run --env-file ./.env puppeteer-service:1.0`

## Known Issues

- To run development mode, make sure the docker-compose file has volume and tsnd command has --poll, otherwise it won't reload on changes
- Docker compose volume for the app must be set to only src folder, not the root folder. Using root folder will make the dockerized app unable to run cause of invalid executable's binary (sharp package) to run (since node modules will contain executables for windows, not for linux)

## TODOs

- endpoints to queue the OG jobs
- bull can probably be updated to use bull-mq for native typescript support
- creating schema for saving credentials of yachtscoring
- puppeteer service to test the credentials
- puppeteer services to scrape data
