FROM node:8.12.0-alpine
WORKDIR /src
COPY package*.json ./
RUN npm install 
COPY . .
CMD [ "node", "." ]