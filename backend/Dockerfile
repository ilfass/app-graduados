FROM node:18

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

RUN npm run build

EXPOSE 3000

RUN mkdir -p /app/data /app/uploads/fotos && chown -R node:node /app

USER node

CMD ["npm", "start"] 