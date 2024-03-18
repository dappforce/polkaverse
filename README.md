# Example dapp on the Subsocial blockchain by [DappForce](https://github.com/dappforce)

![Production Deploy](https://github.com/dappforce/polkaverse/actions/workflows/build-deploy.yml/badge.svg)

PolkaVerse is a niche social site built on the Subsocial network. It focuses on the Polkadot and Kusama ecosystem. You can use this this code to help you in the development of your own dapps running on or integrated with Subsocial.

Visit Subsocial's [website](https://subsocial.network) to learn more about the project.

## Guide to build and deploy polkaverse

### Build the docker images

1. Prepare the [dockerfile](./docker/Dockerfile) and adjust the config if needed.
2. Build the image in local with this command and please ensure to add build argument.

```bash
$ docker build --build-arg GH_GA_ID=valueREDACTED --build-arg GH_APP_KIND=valueREDACTED --build-arg GH_HCAPTCHA_SITE_KEY=valueREDACTED --build-arg GH_AMP_ID=valueREDACTED --build-arg GH_OFFCHAIN_SIGNER_URL=valueREDACTED --build-arg GH_CONNECTION_KIND=valueREDACTED --build-arg GH_SELLER_CLIENT_ID=valueREDACTED --build-arg GH_SERVER_MNEMONIC==valueREDACTED --build-arg GH_SELLER_TOKEN_SIGNER=valueREDACTED --build-arg GH_NEXT_PUBLIC_DATAHUB_QUERY_URL=valueREDACTED --build-arg GH_NEXT_PUBLIC_DATAHUB_SUBSCRIPTION_URL=valueREDACTED --build-arg GH_DATAHUB_QUEUE_URL=valueREDACTED --build-arg GH_DATAHUB_QUEUE_TOKEN=valueREDACTED -t polkaverse-docker-image:latest .
```

Notes:
Please execute the build process with theses build arguments, you need to specify the value.

- GH_APP_KIND=forklog
- GH_CONNECTION_KIND=main
- GH_AMP_ID=OPTIONAL
- GH_GA_ID=OPTIONAL

3. Then check the docker images that has been builded.

```bash
$ docker images | grep "polkaverse"
```

### Run the container with docker-compose

1. To run the docker images with docker-compose, please prepare the docker-compose.yaml config file at first.

```yaml
# docker-compose.yml
version: '3'
services:
  web-ui:
    image: polkaverse-docker-image:latest
    ports:
      - '3003:3003' # Application port
    container_name: polkaverse-web-app
    restart: on-failure
```

```bash
$ docker-compose -f docker-compose.yaml up -d
```

2. Check the running container with this command.

```bash
$ docker-compose ps
$ docker-compose logs
```

3. Test to connect to the application.

```bash
$ curl -I http://localhost:3003
```

## Run locally

Clone this repo:

```sh
git clone git@github.com:dappforce/polkaverse.git
cd polkaverse
```

Create an `.env` file with settings that allow the app to connect to Subsocial's infrastructure:

```sh
cp dev.env .env.local
```

Install a compatible version of Node.js. The compatible versions are specified in the `package.json` file.
If you have installed NVM simply run `nvm install && nvm use` to use the Node.js version specified in the .nvmrc file.

Install project dependencies:

```sh
npm install --global yarn
yarn
```

### Option A: Run in a DEV mode

Dev mode supports hot reloads – this is very helpful when developing UI because you can see changes in your browser without restarting the app. But it takes some time (in seconds) to compile the updated parts of the app, after you made changes to the source code.

```sh
yarn dev
```

### Option B: Run in a PROD mode

Prod mode doesn't support hot reloads, but works super fast, because the UI gets compiled by Next.js before running the app.

```sh
yarn build
yarn start
```

Go to [localhost:3003](http://localhost:3003)

### Customization

You can customize the app by changing the following variables in `config/app/polkaverse` file, or by creating a new file in `config/app` folder and setting `APP_KIND` variable in `.env` file to the name of your new file.
