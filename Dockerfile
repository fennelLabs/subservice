FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 6060

CMD [ "node", "run", "start" ]