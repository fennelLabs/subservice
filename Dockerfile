FROM node:18

WORKDIR /app
COPY . .
RUN npm install -g pm2
RUN npm ci
RUN npm run build

EXPOSE 6060
ENV NODE_ENV=production
