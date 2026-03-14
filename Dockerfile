FROM node:25

RUN apt-get update && apt-get install -y docker.io

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ENV PORT=8000

EXPOSE $PORT

CMD [ "npm", "run", "dev" ]