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
    PolicyArn: policy.Arn,
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
    PolicyArn: policy.Arn,
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
    'licenseDetails.licenseKey': licenseKey,
  });

  if (!client) {
    throw new Error(`Cannot generate AWS creds for invalid license key ${licenseKey}`);
  }

  if (!(client.accessKeys && client.accessKeys.length > 0)) {
    const awsPolicy = await generateImagePullPolicy(client.clientId);
    const awsUser = await generateUser(client.clientId);
    // eslint-disable-next-line no-unused-vars
    await applyPolicyToUser(awsPolicy, awsUser);
    const awsCreds = await createAccessToken(awsUser);
    await License.update(
      {
        _id: client._id,
      },
      {
        $set: {
          'awsMetaData.user': awsUser,
        },
        $push: {
          'awsMetaData.policies': awsPolicy,
          'awsMetaData.accessKeys': { ...awsCreds, PolicyId: awsPolicy.PolicyId },
        },
      }
    );
    const licence = await License.findOne({ _id: client._id });
    return { clientId: client.clientId, accessKeys: licence.accessKeys[0] };
  }
  return { clientId: client.clientId, accessKeys: client.accessKeys[0] };
}

module.exports = {
  createAccessToken,
  deleteUserPolicy,
  applyPolicyToUser,
  generateUser,
  generateImagePullPolicy,
  generateAWSCreds,
};
