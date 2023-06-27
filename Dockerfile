FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm ci --omit=dev
COPY . .

EXPOSE 6060
ENV NODE_ENV=production