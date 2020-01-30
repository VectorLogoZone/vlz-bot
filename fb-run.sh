#!/bin/bash
#
# post a single random logo to twitter
#

set -o errexit
set -o pipefail
set -o nounset

reset

export $(cat .env)


curl -i -X POST \
 -d "source=https://www.facebook.com/images/fb_icon_325x325.png" \
 -d "published=false" \
 -d "access_token=${FACEBOOK_ACCESS_TOKEN}" \
 "https://graph.facebook.com/${FACEBOOK_PAGE_ID}/photos"

# npx tsc && node dist/facebook-cli.js | ./node_modules/.bin/pino-pretty
