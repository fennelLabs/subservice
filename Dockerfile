FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install -g pm2
RUN npm install
RUN npm ci --omit=dev
RUN npm run build
COPY . .

EXPOSE 6060
ENV NODE_ENV=production
