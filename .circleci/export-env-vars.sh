#!/usr/bin/env bash

export COMMIT_HASH=${CIRCLE_SHA1}

if [ ! -z "$JENKINS_HOME" ];
then
  export CIRCLE_BRANCH="$BRANCH_NAME"
  export COMMIT_HASH="$GIT_COMMIT"
fi
if [ "$CIRCLE_TAG" = "production" ] || [ "$CIRCLE_BRANCH" = "master" ];
then
  # export NODE_ENV=dev
  # export CLUSTER_PREFIX="dev";
  export NODE_ENV=production
  export CLUSTER_PREFIX="production-ap-south-1b"
  export MY_HOST="https://enterprise-api.blockcluster.io";
elif [ "$CIRCLE_TAG" = "staging" ] || [ "$CIRCLE_BRANCH"  = "staging" ];
then
  export NODE_ENV=staging
  export CLUSTER_PREFIX="dev"
  export MY_HOST="https://enterprise-api-dev.blockcluster.io";
elif [ "$CIRCLE_TAG" = "dev" ] ||  [ "$CIRCLE_BRANCH" = "dev" ];
then
  export NODE_ENV=dev
  export CLUSTER_PREFIX="dev";
elif [ "$CIRCLE_TAG" = "test" ] || [ "$CIRCLE_BRANCH" = "test" ] || [ "$IS_TEST" = "1" ];
then
  export NODE_ENV=test
  export CLUSTER_PREFIX="dev";
fi


export IMAGE_NAME='402432300121.dkr.ecr.us-west-2.amazonaws.com/licensing-micro'
export IMAGE_TAG="${NODE_ENV}-${COMMIT_HASH}"
