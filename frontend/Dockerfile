FROM node:slim

WORKDIR /frontend
COPY package*.json /frontend/
RUN npm install
COPY . /frontend/
EXPOSE 3000