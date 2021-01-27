FROM node:10.23.1-alpine

COPY ./package.json /home/app/package.json
COPY . /home/app/
WORKDIR /home/app
RUN npm install
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/node", "index.js"]