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
