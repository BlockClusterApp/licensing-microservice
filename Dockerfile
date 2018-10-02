FROM node:8.12.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY . .
ENV PORT=4000
CMD [ "node", "index" ]