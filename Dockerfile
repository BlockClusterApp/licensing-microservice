FROM node:8.12.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY . .
ENV PORT=3000
CMD [ "node", "." ]