#!/usr/bin/env bash

. ./.circleci/export-env-vars.sh

eval $(aws ecr get-login --no-include-email --region us-west-2)

docker push ${IMAGE_NAME}:${IMAGE_TAG}

docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:${NODE_ENV}

docker push ${IMAGE_NAME}:${NODE_ENV}