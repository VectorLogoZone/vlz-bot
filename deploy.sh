#!/bin/bash
#docker login -u oauth2accesstoken -p "$(gcloud auth print-access-token)" https://gcr.io

docker build -t vlz-bot .
docker tag vlz-bot:latest gcr.io/vectorlogozone/bot:latest
docker push gcr.io/vectorlogozone/bot:latest

gcloud beta run deploy vlz-bot \
	--image gcr.io/vectorlogozone/bot \
	--platform managed \
	--project vectorlogozone \
    --region us-central1 \
	--update-env-vars "COMMIT=$(git rev-parse --short HEAD),LASTMOD=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
