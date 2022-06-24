import { CfnOutput, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Networking } from './networking';
import { DocumentManagementAPI } from './api';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

export class TomsAwscdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwscdkTestQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const bucket = new Bucket(this, 'TomsDocumentBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

    new s3Deploy.BucketDeployment(this, 'DocumentsDeployment', {
      sources: [
        s3Deploy.Source.asset(path.join(__dirname,  '..', 'documents'))
      ],
      destinationBucket: bucket,
      memoryLimit: 512
    })

    new CfnOutput(this, 'DocumentBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentBucketName'
    });

    const networkingStack = new Networking(this, 'TomsNetworkingConstruct', {
      maxAzs: 2
    });

    Tags.of(networkingStack).add('Module','Networking');

    const api = new DocumentManagementAPI(this, 'DocumentManagementAPI', { documentBucket: bucket });

    Tags.of(api).add('Module', 'API');

  }
}
