const aws = require('aws-sdk');
const randomstring = require('randomstring');
const License = require('../../schema/license-schema');
const config = require('../../config');

const IAM = new aws.IAM({
  accessKeyId: process.env.LICENCE_IAM_ACCESS_KEY_ID,
  secretAccessKey: process.env.LICENCE_SECRET_ACCESS_KEY,
});

const ECR = new aws.ECR({
  accessKeyId: config.aws.ACCESS_KEY_ID,
  secretAccessKey: config.aws.SECRET_ACCESS_KEY,
  region: 'us-west-2',
});

function generateImagePullPolicy(clientId) {
  const policy = `{
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
            "Resource": [
              "arn:aws:ecr:us-west-2:402432300121:repository/${clientId}-webapp",
              "arn:aws:ecr:us-west-2:402432300121:repository/hyperion-scaler"
          ]
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
  console.log(policy);
  return new Promise((resolve, reject) => {
    IAM.createPolicy(
      {
        PolicyDocument: policy,
        PolicyName: `${clientId}-wa-ecr`,
        Description: `Policy for ${clientId} to fetch WEBAPP repo from ECR and hyperion scaler`,
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data.Policy);
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
      return resolve(data.User);
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
      return resolve(data.AccessKey);
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

  if (!client.status) {
    return { clientId: client.clientId, accessKeys: {}, registryIds: [] };
  }

  if (!(client.awsMetaData && client.awsMetaData.accessKeys && client.awsMetaData.accessKeys.length > 0)) {
    const awsPolicy = await generateImagePullPolicy(client.clientId);
    const awsUser = await generateUser(client.clientId);
    // eslint-disable-next-line no-unused-vars
    await applyPolicyToUser(awsPolicy, awsUser);
    const awsCreds = await createAccessToken(awsUser);
    await License.updateOne(
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
    const registryIds = licence.awsMetaData.ecrRepositories.map(i => i.RegistryId);
    return { clientId: client.clientId, accessKeys: licence.awsMetaData.accessKeys[0], registryIds };
  }
  const registryIds = client.awsMetaData.ecrRepositories.map(i => i.RegistryId);
  return { clientId: client.clientId, accessKeys: client.awsMetaData.accessKeys[0], registryIds };
}

function createECRRepository(clientId, repoType = 'webapp') {
  const params = {
    repositoryName: `${clientId}-${repoType}`,
  };

  return new Promise((resolve, reject) => {
    ECR.createRepository(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data.repository);
    });
  });
}

module.exports = {
  createAccessToken,
  deleteUserPolicy,
  applyPolicyToUser,
  generateUser,
  generateImagePullPolicy,
  generateAWSCreds,
  createECRRepository,
};
