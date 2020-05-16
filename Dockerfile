FROM node:13.8

WORKDIR /home/node/app
COPY . .

ENV NODE_ENV=production
RUN npm ci

USER node

EXPOSE 8080

CMD [ "node", "./dist/index.js" ]

USER ${UID}:${GID}
