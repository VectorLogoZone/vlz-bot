#!/bin/bash
#
# post a single random logo to twitter
#

set -o errexit
set -o pipefail
set -o nounset

export $(cat .env)

npx tsc && node dist/tweet-cli.js | ./node_modules/.bin/pino-pretty
