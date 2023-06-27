FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 6060
ENV NODE_ENV=production

CMD [ "npm", "run", "start" ]
