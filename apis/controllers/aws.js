const aws = require('aws-sdk');
const randomstring = require('randomstring');
const License = require('../../schema/license-schema');

const IAM = new aws.IAM();

function generateImagePullPolicy(clientId) {
  const policy = `
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "${randomstring.generate({
    readable: true,
    length: 14,
  })}",
            "Effect": "Allow",
            "Action": [
                "ecr:BatchGetImage",
                "ecr:DescribeImages",
                "ecr:BatchCheckLayerAvailability"
            ],
            "Resource": "arn:aws:ecr:us-west-2:402432300121:repository/${clientId}-webapp"
        },
        {
            "Sid": "${randomstring.generate({
    readable: true,
    length: 14,
  })}",
            "Effect": "Allow",
            "Action": "ecr:GetAuthorizationToken",
            "Resource": "*"
        }
    ]
  }`;
  return new Promise((resolve, reject) => {
    IAM.createPolicy(
      {
        PolicyDocument: policy,
        PolicyName: `${clientId}-wa-ecr`,
        Description: `Policy for ${clientId} to fetch WEBAPP repo from ECR`,
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      }
    );
  });
}

function generateUser(clientId) {
  const params = {
    UserName: `${clientId}@enterprise.blockcluster.io`,
  };
  return new Promise((resolve, reject) => {
    IAM.createUser(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

function applyPolicyToUser(policy, user) {
  const params = {
    PolicyArn: policy.arn,
    UserName: user.UserName,
  };

  return new Promise((resolve, reject) => {
    IAM.attachUserPolicy(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

function deleteUserPolicy(policy, user) {
  const params = {
    PolicyArn: policy.arn,
    UserName: user.UserName,
  };

  return new Promise((resolve, reject) => {
    IAM.detachUserPolicy(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

function createAccessToken(user) {
  const params = {
    UserName: user.UserName,
  };

  return new Promise((resolve, reject) => {
    IAM.createAccessKey(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

async function generateAWSCreds(licenseKey) {
  const client = await License.findOne({
    'licenseDetails.license_key': licenseKey,
  });

  if (!client) {
    throw new Error(`Cannot generate AWS creds for invalid license key ${licenseKey}`);
  }
}

module.exports = {
  createAccessToken,
  deleteUserPolicy,
  applyPolicyToUser,
  generateUser,
  generateImagePullPolicy,
  generateAWSCreds,
};
