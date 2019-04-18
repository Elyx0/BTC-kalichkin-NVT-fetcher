FROM node:11-alpine
RUN apk add --update --no-progress make python bash
ENV NPM_CONFIG_LOGLEVEL error

# Dumb init so PID != 1
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

RUN mkdir -p /usr/src/app
RUN adduser -S nodejs
WORKDIR /usr/src/app
COPY package*.json ./
RUN chown nodejs: /usr/src/app
RUN chmod -R 777 .
USER nodejs




#COPY package.json .
#COPY package-lock.json .

COPY --chown=nodejs:node . ./
#RUN NODE_ENV=production

RUN npm install
RUN npm run build

ENV HOST "0.0.0.0"
ENV PORT 3000
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]