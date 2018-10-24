FROM node:8.12.0-alpine
WORKDIR /src
RUN npm install pm2 -g

COPY package*.json ./
RUN npm install 
COPY index.js ./
CMD ["pm2-runtime", "index.js", "--watch"]
