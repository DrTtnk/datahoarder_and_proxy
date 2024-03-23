# DataHoarder&Proxy

Ultra basic exercise

## Getting Started

```shell
git clone git@github.com:DrTtnk/datahoarder_and_proxy.git

cd datahoarder_and_proxy

./bootstrap.sh

docker compose up
```

## Running it

```shell
npm run cluster
```

## Running the tests

```shell
  docker compose --env-file ./.dockerized.env up --build -d --wait --remove-orphans -t 10

  npm run test:integration

  docker compose down -t 10
```

### Postman

You also have a postman collection in the root of the project.

### ToDo

Support return status code `418`
