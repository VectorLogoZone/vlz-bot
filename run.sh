#!/bin/bash
#
# run locally for dev
#

set -o errexit
set -o pipefail
set -o nounset

export $(cat .env)

yarn run build
node dist/tweet-cli.js