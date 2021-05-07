FROM node:10.23.1-alpine

ADD . /home/app
WORKDIR /home/app
EXPOSE 8080
RUN npm install

CMD node index.js
