# puppeteer-server

A service that will handle puppeteer related tasks to offload the burden from LDS

---

- [puppeteer-server](#puppeteer-server)
  - [Installation](#installation)
    - [Development Mode](#development-mode)
    - [Build Mode](#development-mode)
    - [Encryption Key](#encryption-key)
  - [Known Issues](#known-issues)
  - [Jobs](#jobs)
    - [Yacht Scoring Jobs](#yacht-scoring-jobs)
    - [Open Graph Jobs](#open-graph-jobs)

## Installation

### Development Mode

Run `docker-compose up` to start development mode

### Build Mode

1. Build the image with `docker build -t puppeteer-service:1.0 .`
2. Run `docker run --env-file ./.env puppeteer-service:1.0`

### Encryption Key

To run this app, you will need to generate a secure 256-bit keys in hex format to feed the encryption function. For simplifying this process, run `ts-node scripts/generateSecureKey.ts "some passphrase"` and it will log a secure key. Add the key to .env file before running the app.

## Known Issues

- To run development mode, make sure the docker-compose file has volume and tsnd command has --poll, otherwise it won't reload on changes
- Docker compose volume for the app must be set to only src folder, not the root folder. Using root folder will make the dockerized app unable to run cause of invalid executable's binary (sharp package) to run (since node modules will contain executables for windows, not for linux)

## Jobs

There are 2 main jobs that will be done by puppeteer server:

### Yacht Scoring Jobs

`Puppeteer Server` main objective is to test the credentials to external services, such as `YachtScoring` that the users to imported into their SYRF account. The process is as follow:

1. User submit the credentials via the SYRF website
2. SYRF Website will send the credentials to the SYRF Backend API (`Live Data Server`)
3. `Live Data Server` will encrypt the credentials and queue it to redis, for `Puppeteer Server` to pick up.
4. `Puppeteer Server` will launch a puppeteer browser pointing to `YachtScoring` (or other external services in the future) and fill in the Login form.
5. If login with the credentials is successful, `Puppeteer Server` will store the encrypted credentials to the database, linked to the SYRF user that submits the request. The user can then import an event from yachtscoring into SYRF.

To import an existing event from `YachtScoring`:

1. User submit request to get the events from their account in `YachtScoring` through SYRF Website Event management page.
2. SYRF Website will submit the request to the SYRF Backend API
3. `Live Data Server` will queue a job to redis for `Puppeteer Server` to pick up
4. `Puppeteer Server` will launch a puppeteer browser, login to `YachtScoring` using stored credentials, and head to the event list page on `YachtScoring`
5. The data from this event list page will be returned from the Job, and added to the response to the SYRF Website.
6. SYRF Website will show the list of events available for the user to choose from
7. Once the user select one of the event, `Live Data Server` will queue another job for `Puppeteer Server` to start scraping the vessel and participant list to copy into the SYRF event.
8. Once `Puppeteer Server` done scraping, it will send the details to another queue that will be processed by `Live Data Server` to validate and process into the event in SYRF

### Open Graph Jobs

`Puppeteer Server` also has a responsibility to create the open graphs for both `Calendar Event` & `Competition Unit` from SYRF:

1. User creates a `Calendar Event` and/or `Competition Unit`
2. `Live Data Server` queues a job for `Puppeteer Server`
3. `Puppeteer Server` launch a puppeteer browser that will open a html with specified mapbox tiles, centered in the position of the `Calendar Event` and/or `Competition Unit`
4. The screen of this map view is then screen-grabbed and save into AWS S3 and database records of `Calendar Event` and/or `Competition Unit` are updated with the returned value (S3 Url)
