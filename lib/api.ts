import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apig from '@aws-cdk/aws-apigatewayv2-alpha'
import * as cdk from 'aws-cdk-lib';
import * as apiIntegration from '@aws-cdk/aws-apigatewayv2-integrations-alpha';



export interface DocumentManagementAPIProps {
    documentBucket: s3.Bucket
}

export class DocumentManagementAPI extends Construct {
  constructor(scope: Construct, id: string, props: DocumentManagementAPIProps) {
    super(scope, id);

    const getDocumentsFunction = new lambda.NodejsFunction(this, 'GetDocumentsFunction', {
        runtime: Runtime.NODEJS_16_X,
        entry: path.join(__dirname, '..', 'api', 'getDocuments', 'index.ts'),
        handler: 'getDocuments',
        environment: {
            DOCUMENTS_BUCKET_NAME: props.documentBucket.bucketName
        }
    })

    const bucketPermissions = new iam.PolicyStatement();
    bucketPermissions.addResources(`${props.documentBucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');
    getDocumentsFunction.addToRolePolicy(bucketPermissions);

    const bucketContainerPermissions = new iam.PolicyStatement();
    bucketContainerPermissions.addResources(props.documentBucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');
    getDocumentsFunction.addToRolePolicy(bucketContainerPermissions);

    const httpApi = new apig.HttpApi(this, 'HttpAPI', {
        apiName: 'document-management-api',
        createDefaultStage: true,
        corsPreflight: {
          allowMethods: [apig.CorsHttpMethod.GET],
          allowOrigins: ['*'],
          maxAge: cdk.Duration.days(10),
        }
      });

      const integration = new apiIntegration.HttpLambdaIntegration('APIIntegration', getDocumentsFunction);
      httpApi.addRoutes({
        path: '/getDocuments',
        methods: [
          apig.HttpMethod.GET
        ],
        integration: integration
      });

      new cdk.CfnOutput(this, 'APIEndpoint', {
        value: httpApi.url!,
        exportName: 'APIEndpoint'
      })
  }
}