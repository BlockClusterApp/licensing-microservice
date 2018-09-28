[![CircleCI](https://circleci.com/gh/BlockClusterApp/licensing-microservice/tree/master.svg?style=svg)](https://circleci.com/gh/BlockClusterApp/licensing-microservice/tree/master)

commands to run:

For AWS LAMBDA:

 there is `serverless.yaml`
also add required variables.
like this: while running `serverless deploy` command
`
--STAGE <production or dev or staging whatever>
--MONGO_URL <MONGO URL>
--REGION < e.g: us-east-2>
`

