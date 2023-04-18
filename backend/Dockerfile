FROM node:slim

WORKDIR /backend
COPY package*.json /backend/
RUN npm install
RUN npm install nodemon -g
ENV PATH /backend/node_modules/.bin:${PATH}
ENTRYPOINT [ "nodemon", "--legacy-watch", "--inspect=0.0.0.0", "./app.js"]

COPY . /backend/