FROM node:12
WORKDIR /usr/src/app
COPY ./dist/src/ ./
RUN npm install --only=prod
CMD [ "node","index.js" ]