#!/bin/bash
# 
# deploy credentials
#

export $(cat .env)

gcloud beta run services update vlz-bot \
	--project vectorlogozone \
    --region us-central1 \
	--update-env-vars "LOG_LEVEL=debug,TWITTER_CONSUMER_KEY=${TWITTER_CONSUMER_KEY},TWITTER_CONSUMER_SECRET=${TWITTER_CONSUMER_SECRET},TWITTER_ACCESS_TOKEN=${TWITTER_ACCESS_TOKEN},TWITTER_ACCESS_SECRET=${TWITTER_ACCESS_SECRET}"

