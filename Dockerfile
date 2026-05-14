FROM node:25

RUN apt-get update && apt-get install -y docker.io

WORKDIR /app

COPY package.json .

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "production" ];\
    then npm install --omit=dev; \
    else npm install; \
    fi

COPY . .

RUN if [ "$NODE_ENV" = "production" ];\
    then npm run build;\
    fi

ENV PORT=8000

EXPOSE $PORT

CMD [ "npm", "run", "dev" ]