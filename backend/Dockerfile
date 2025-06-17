FROM node:18

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

RUN npm install

COPY backend/src ./src

RUN npm run build

EXPOSE 3000

RUN mkdir -p /app/data && chown -R node:node /app

USER node

CMD ["npm", "start"] 