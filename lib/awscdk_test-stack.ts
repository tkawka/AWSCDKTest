import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Networking } from './networking';

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

    new CfnOutput(this, 'DocumentBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentBucketName'
    });

    new Networking(this, 'TomsNetworkingConstruct', {
      maxAzs: 2
    })

  }
}
