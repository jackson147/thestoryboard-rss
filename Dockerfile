# Common build stage
FROM node:14.21.3-alpine3.17 as common-build-stage

RUN apk add --update python3 && apk add --update alpine-sdk

COPY . ./app

WORKDIR /app

RUN npm install

EXPOSE 3000

# Dvelopment build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production

RUN npm run build
CMD ["npx", "cross-env", "NODE_ENV=production", "node", "dist/server.js"]