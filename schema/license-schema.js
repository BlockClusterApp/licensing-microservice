const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const redis = require('../boot/redis');

const { Schema } = mongoose;

const LicenseSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      unique: 'Client ID already Exists.',
    },
    licenseDetails: {
      licenseKey: String,
      licenseCreated: Date,
      licenseExpiry: Date,
    },
    access_key: {
      type: String,
      select: false,
    },
    daemonTokens: [
      {
        access_token: String,
        isValid: Boolean,
      },
    ],
    clientDetails: {
      clientName: String,
      emailId: {
        type: String,
        unique: 'Email already Exists.',
      },
      phone: {
        type: String,
        unique: 'Phone already Exists.',
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
    awsMetaData: {
      user: {
        Arn: String,
        CreateDate: Date,
        Path: String,
        UserId: String,
        UserName: String,
      },
      ecrRepositories: [
        {
          RepoType: String,
          Arn: String,
          RegistryId: String,
        },
      ],
      policies: [
        {
          PolicyName: String,
          PolicyId: String,
          Arn: String,
          Path: String,
          DefaultVersionId: String,
          AttachmentCount: Number,
          PermissionsBoundaryUsageCount: Number,
          IsAttachable: Boolean,
          Description: String,
          CreateDate: Date,
          UpdateDate: Date,
        },
      ],
      accessKeys: [
        {
          PolicyId: String,
          AccessKeyId: String,
          CreateDate: Date,
          SecretAccessKey: String,
          Status: String,
          UserName: String,
        },
      ],
    },
    clientMeta: {
      // some brief description may be
      type: String,
    },
    clientLogo: {
      // if exist
      type: String,
    },
    servicesIncluded: {
      /**
       * so in this we can d like below:
       * {payment: true}
       * {voucher: true}
       * */
      type: Map,
    },
    agentMeta: {
      daemonVersion: String,
      webAppVersion: String,
      shouldDaemonDeployWebApp: Boolean,
      webAppMigration: Number,
      shouldWebAppRefreshAWSImageAuth: Boolean,
      operationType: Number,
    },
    clusterConfig: {
      clusters: Map,
      webapp: {
        dynamo: { type: Map },
        impulse: { type: Map },
        privatehive: { type: Map },
        mongoURL: { type: Map },
        redis: { type: Map },
        webapp: { type: Map },
        smtp: {
          host: { type: String },
          port: { type: String },
          auth: {
            user: { type: String },
            pass: { type: String },
          },
        },
        rootUrl: { type: Map },
        Ingress: { type: Map },
        paymeter: { type: Map },
      },
    },
  },
  {
    collection: 'clients',
    timestamps: true,
  }
);
LicenseSchema.plugin(beautifyUnique);
LicenseSchema.index({
  'licenseDetails.licenseKey': 1,
});

LicenseSchema.statics.findClientIdFromLicenceKey = async function fetchFromCache(licenceKey) {
  const key = `client/${licenceKey}`;
  let clientId = await redis.get(key);
  if (!clientId) {
    const licence = await this.findOne({ 'licenseDetails.licenseKey': licenceKey });
    clientId = licence.clientId; // eslint-disable-line
    await redis.setex(key, 60 * 60 * 24, clientId);
  }
  return clientId;
};

LicenseSchema.statics.findClientIdFromId = async function fetchFromCache(id) {
  if (!id) {
    return undefined;
  }
  const key = `client/${id}`;
  let clientId = await redis.get(key);
  if (!clientId) {
    const licence = await this.findOne({ _id: id });
    clientId = licence.clientId; // eslint-disable-line
    await redis.setex(key, 60 * 60 * 24, clientId);
  }
  return clientId;
};

const LicenseModel = mongoose.model('client', LicenseSchema);

module.exports = LicenseModel;

/**
 *
 * Cluster Config {
 *  "dev": {
      "us-west-2": {
        "masterAPIHost": "https://k8s-dev-us-west-2-api.blockcluster.io",
        "workerNodeIP": "35.161.9.16",
        "locationCode": "us-west-2",
        "dynamoDomainName": "dev.blockcluster.io",
        "apiHost": "https://dev.blockcluster.io",
        "locationName": "US West (Oregon)",
        "auth": {
          "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJibG9ja2NsdXN0ZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoiYmxvY2tjbHVzdGVyLXdlYmFwcC10b2tlbi02bTZybiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJibG9ja2NsdXN0ZXItd2ViYXBwIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiN2U1OTZhOWItMzJiNC0xMWU5LWE5NGItMDI0ZDE4YzE2YTkyIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmJsb2NrY2x1c3RlcjpibG9ja2NsdXN0ZXItd2ViYXBwIn0.KoreE8lSCMeXt0TPHw6cjrVZMtmbEi8kbjng3kbdWoyRyM7BqeQZV37iSPq67a58Nb-4tlDTMsobdySlR0JRBsJjND3UUTopOZ75bw6N8w6ZNIVF1YDGlyH4E8syKOF30xd17ty4cpe5UwKmvVw71wHfMmephfKAiQZa_icgxTP2ndZv0SlM1JevR1UkowsGYrdjJOgXIrrmeAIaDcPEIWUvAO4O-vRh5GTwURuyPl7zMwJaER37ukAL8V-AetEEXF08O8zgJqWoi03SB56O8L-4S8ISV8dbDNFaDQ-Cumnfxnlb3mfI3Z9FPYCz8H_1iKkOp58qL_qL5whfPKo1OQ"
        },
        "hyperion": {
          "ipfsPort": "31975",
          "ipfsClusterPort": "31115"
        }
      }
    }
  }
 *
 *
 *
 * WebappConfig: {
 *   "dynamo": {
    "dev": "402432300121.dkr.ecr.us-west-2.amazonaws.com/dynamo:dev",
  },
  "impulse": {
    "dev": "402432300121.dkr.ecr.us-west-2.amazonaws.com/impulse:dev",
  },
  "privatehive": {
    "dev": {
      "peer": "402432300121.dkr.ecr.ap-south-1.amazonaws.com/privatehive-peer-api:dev",
      "orderer": "402432300121.dkr.ecr.ap-south-1.amazonaws.com/privatehive-orderer-api:dev"
    }
  },
  "mongoURL": {
    "dev": "mongodb://35.161.9.16:32153"
  },
  "redis": {
    "dev": {
      "host": "redis-master.dev.svc.cluster.local",
      "port": "6379"
    }
  },
  "webapp": {
    "dev": "402432300121.dkr.ecr.us-west-2.amazonaws.com/webapp:dev"
  },
  "smtp": {
    "host": "",
    "port": "",
    "auth": {
      "user": "",
      "pass": ""
    }
  },
  "rootUrl": {
    "dev": "https://dev.blockcluster.io",
  },
  "Ingress": {
    "dev": {
      "Annotations": {},
      "secretName": "blockcluster-ssl"
    }
  },
  "paymeter": {
    "dev": {
      "blockchains": {
        "eth": {
          "testnet": {
            "url": "wss://rinkeby.infura.io/ws/v3/a71954447581416991b1371b44b305dd"
          },
          "mainnet": {
            "url": "wss://mainnet.infura.io/ws/v3/a71954447581416991b1371b44b305dd"
          }
        }
      },
      "api_keys": {
        "coinmarketcap": "5695d8e3-ecf8-47e1-895b-1fd0c67edea9",
        "ethplorer": "freekey"
      }
    }
  }
 * }
 */
