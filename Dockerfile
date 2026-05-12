FROM node:25

RUN apt-get update && apt-get install -y docker.io

WORKDIR /app

COPY package.json .

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "production" ];\
    then npm install; \
    else npm install --omit=dev; \
    fi

COPY . .

ENV PORT=8000

EXPOSE $PORT

CMD [ "node", "src/server.js" ]