FROM ubuntu:18.04 as builder

ARG GH_SUBSTRATE_URL
ARG GH_SUBSTRATE_RPC_URL
ARG GH_OFFCHAIN_URL
ARG GH_OFFCHAIN_WS
ARG GH_IPFS_NODE_URL
ARG GH_GA_ID
ARG GH_CONNECTION_KIND
ARG GH_APP_KIND
ARG GH_APP_BASE_URL

ENV SUBSTRATE_URL=${GH_SUBSTRATE_URL} \
    SUBSTRATE_RPC_URL=${GH_SUBSTRATE_RPC_URL} \
    OFFCHAIN_URL=${GH_OFFCHAIN_URL} \
    OFFCHAIN_WS=${GH_OFFCHAIN_WS} \
    IPFS_NODE_URL=${GH_IPFS_NODE_URL} \
    GA_ID=${GH_GA_ID} \
    APP_KIND=${GH_APP_KIND} \
    APP_BASE_URL=${GH_APP_BASE_URL} \
    CONNECTION_KIND=${GH_CONNECTION_KIND}


RUN apt-get update \
    && apt-get install -y libusb-1.0-0-dev build-essential git curl gnupg gcc-4.8 g++-4.8 \
    && export CXX=g++-4.8

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install yarn -g

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

WORKDIR /app
COPY . .

RUN yarn

COPY ci.env .env
RUN yarn export-env \
    && NODE_ENV=production yarn build  \
    && yarn export-env

FROM node:16-alpine3.15

ARG GH_SUBSTRATE_URL
ARG GH_SUBSTRATE_RPC_URL
ARG GH_OFFCHAIN_URL
ARG GH_OFFCHAIN_WS
ARG GH_IPFS_NODE_URL
ARG GH_GA_ID
ARG GH_CONNECTION_KIND
ARG GH_APP_KIND
ARG GH_APP_BASE_URL

ENV SUBSTRATE_URL=${GH_SUBSTRATE_URL} \
    SUBSTRATE_RPC_URL=${GH_SUBSTRATE_RPC_URL} \
    OFFCHAIN_URL=${GH_OFFCHAIN_URL} \
    OFFCHAIN_WS=${GH_OFFCHAIN_WS} \
    IPFS_NODE_URL=${GH_IPFS_NODE_URL} \
    GA_ID=${GH_GA_ID}  \
    APP_KIND=${GH_APP_KIND} \
    APP_BASE_URL=${GH_APP_BASE_URL} \
    CONNECTION_KIND=${GH_CONNECTION_KIND}

WORKDIR /app

COPY --from=builder /app .

CMD [ "yarn", "start" ]
