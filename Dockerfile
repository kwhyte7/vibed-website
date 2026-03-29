FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci
COPY . .

RUN npm run build
RUN npm install serve

EXPOSE 8080

CMD ["npm", "run", "preview", "--", "--port", "8080", "--host", "0.0.0.0"]
