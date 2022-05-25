FROM node:16-alpine

WORKDIR /workers

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]