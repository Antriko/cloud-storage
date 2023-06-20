FROM node:slim

WORKDIR /frontend
COPY package*.json /frontend/
RUN npm install
COPY . /frontend/
ARG PORT_FRONTEND
EXPOSE ${PORT_FRONTEND}