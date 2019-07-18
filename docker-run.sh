#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

export $(cat .env)

docker build -t vlz-bot .
docker run \
	--publish 4000:4000 \
	--expose 4000 \
	--env PORT='4000' \
	--env COMMIT=$(git rev-parse --short HEAD) \
	--env LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
	--env LOG_LEVEL=debug \
	--env TWITTER_CONSUMER_KEY=${TWITTER_CONSUMER_KEY} \
	--env TWITTER_CONSUMER_SECRET=${TWITTER_CONSUMER_SECRET} \
	--env TWITTER_ACCESS_TOKEN=${TWITTER_ACCESS_TOKEN} \
	--env TWITTER_ACCESS_SECRET=${TWITTER_ACCESS_SECRET} \
	vlz-bot

