<h2 align="center">
  OraiBTC's Backend
</h2>

## Overview

This repository provides backend code for OraiBTC bridge.

## Prerequisite

- NodeJS 10+

## Installation

1. Install required packages

```shell
yarn install
```

2. Set up .env

```shell
NODE_ENV=development
PORT=8888

POLLING_INTERVAL=1000
FIRST_CHECKPOINT_INDEX=0
FIRST_BLOCK_HEIGHT=2818771

# Bitcoin Bridge url
RELAYER_URL=https://oraibtc-relayer.perfogic.store/
LCD_URL=https://oraibtc-rest.perfogic.store/

# Redis
REDIS_HOST="redis host"
REDIS_PORT="redis port"
REDIS_PASSWORD="redis password"
DISCORD_WEBHOOK_URL="discord webhook"
```

3. Dev it or build it

```shell
yarn dev
```
