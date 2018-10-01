FROM node:8:11.3-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install 
COPY . .
ENV PORT=4000
CMD [ "node", "index" ]