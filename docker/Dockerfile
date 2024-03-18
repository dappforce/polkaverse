FROM dappforce/subsocial-base-polkaverse as builder

ARG GH_GA_ID
ARG GH_CONNECTION_KIND
ARG GH_APP_KIND
ARG GH_AMP_ID

ENV NEXT_PUBLIC_GA_ID=${GH_GA_ID} \
    NEXT_PUBLIC_APP_KIND=${GH_APP_KIND} \
    NEXT_PUBLIC_AMP_ID=${GH_AMP_ID} \

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

WORKDIR /opt/subsocial/app
COPY . .

RUN yarn

COPY ci.env .env
RUN NODE_ENV=production yarn build

FROM gcr.io/distroless/nodejs:16 AS runner

ARG GH_GA_ID
ARG GH_CONNECTION_KIND
ARG GH_APP_KIND
ARG GH_AMP_ID

ENV NEXT_PUBLIC_GA_ID=${GH_GA_ID}  \
    NEXT_PUBLIC_APP_KIND=${GH_APP_KIND} \
    NEXT_PUBLIC_AMP_ID=${GH_AMP_ID} \
    NEXT_PUBLIC_CONNECTION_KIND=${GH_CONNECTION_KIND} \

WORKDIR /opt/subsocial/app

COPY --from=builder /opt/subsocial/app .

CMD [ "node_modules/.bin/next", "start", "-p", "3003" ]
