set -e

assert_command () {
  if ! [ -x "$(command -v $1)" ]; then
    echo "Error: $1 is not installed." >&2
    exit 1
  fi
}

assert_command npm
assert_command node
assert_command docker

npm ci
(cd ./dataHoarder && npm ci)
(cd ./proxy       && npm ci)

npm run prepare

docker compose pull
docker compose build --parallel

echo "Would you like to run the integration tests? (y/n)"
read -r run_tests

if [ "$run_tests" = "y" ]; then
  trap "docker compose down -t 10" EXIT

  docker compose --env-file ./.dockerized.env up --build -d --wait --remove-orphans

  npm run test:integration
fi
