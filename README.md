# Example dapp on the Subsocial blockchain by [DappForce](https://github.com/dappforce)

PolkaVerse is a niche social site built on the Subsocial network. It focuses on the Polkadot and Kusama ecosystem. You can use this this code to help you in the development of your own dapps running on or integrated with Subsocial.

Visit Subsocial's [website](https://subsocial.network) to learn more about the project.

## Run locally

Clone this repo:

```sh
git clone git@github.com:dappforce/polkaverse.git
cd polkaverse
```

Create an `.env` file with settings that allow the app to connect to Subsocial's infrastructure:

```sh
cp dev.env .env
```

Install project dependencies:

```sh
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
