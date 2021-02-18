FROM node:12

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

RUN npm prune --production

CMD [ "node", "dist/index.js" ]