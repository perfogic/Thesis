<h2 align="center">
  OraiBTC's Old Frontend
</h2>

## Overview

This repository provides frontend code for OraiBTC bridge.

## Prerequisite

- NodeJS 10+

## Installation

1. Install required packages

```shell
yarn install
```

2. Set up .env

```shell
REACT_APP_SITE_TITLE=OraiBTC
REACT_APP_SITE_DESC="OraiBTC is a bridge between Bitcoin and Cosmos"

REACT_APP_BASE_API_URL=https://api.oraidex.io

REACT_APP_KADO_API_KEY=df0d2b3f-d829-4453-a4f6-1d6e8870e8f4
REACT_APP_MIX_PANEL_ENVIRONMENT=acbafd21a85654933cbb0332c5a6f4f8
REACT_APP_STRAPI_BASE_URL=https://nice-fireworks-d26703b63e.strapiapp.com
```

3. Dev it or build it

```shell
yarn start
yarn build

# typescript generated for scss
yarn ts-css
```

If there is a problem related to `babel-preset-react-app` go to `node_modules/babel-preset-react-app` and run `yarn` then try again

or add this into package.json

```json
"nohoist": [
      "**/babel-preset-react-app/@babel/runtime"
]
```

## License

Released under the [Apache 2.0 License](LICENSE).

Happy comment
