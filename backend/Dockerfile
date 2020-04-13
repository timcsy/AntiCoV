FROM node:12
LABEL Name=anticov-backend Version=0.0.1

# Create app directory
WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .
EXPOSE 80