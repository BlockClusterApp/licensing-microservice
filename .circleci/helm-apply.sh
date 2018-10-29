#!/usr/bin/env bash

. ./.circleci/export-env-vars.sh

aws s3 cp s3://bc-kubeconfig/config ~/.kube/config

helm init --client-only

setVariables="NODE_ENV=${NODE_ENV},image=${IMAGE_NAME},commitHash=${COMMIT_HASH},COMMIT_HASH=${COMMIT_HASH},LICENCE_IAM_ACCESS_KEY_ID=${LICENCE_IAM_ACCESS_KEY_ID},LICENCE_SECRET_ACCESS_KEY=${LICENCE_SECRET_ACCESS_KEY},MONGO_URL=\"${LICENCE_MONGO_URL}\""
releaseName="enterprise-app-${NODE_ENV}"

helm --debug \
  --kube-context "k8s-${CLUSTER_PREFIX}.blockcluster.io" \
  upgrade \
  --install \
  --set ${setVariables} \
  --namespace ${NODE_ENV} \
  $releaseName \
  ./helm-chart

