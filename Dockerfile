FROM node:16-alpine AS builder
WORKDIR /usr/src/app
COPY ["package*.json", "tsconfig.json",  "./"]
RUN npm ci
COPY ./src ./src
RUN npm run build

FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production --silent
COPY --from=builder /usr/src/app/build/ build/
EXPOSE 3000
CMD ["npm", "start"]