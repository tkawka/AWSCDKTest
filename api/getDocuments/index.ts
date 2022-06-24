import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
//import * as S3 from "aws-sdk/clients/s3";

import S3 = require("aws-sdk/clients/s3");

const s3 = new S3({});
const bucketName = process.env.DOCUMENTS_BUCKET_NAME

export const getDocuments = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Bucket Name: ${bucketName}`);

  try {
    const { Contents: results } = await s3.listObjects({ Bucket: process.env.DOCUMENTS_BUCKET_NAME!}).promise();
    const documents = await Promise.all(results!.map(async r => generateSignedURL(r)))
    return {
      statusCode: 200,
      body: JSON.stringify(documents)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    }
  }
}

const generateSignedURL = async (object: S3.Object): Promise<{ filename: string, url: string }> => {
  const url = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucketName,
    Key: object.Key!,
    Expires: (60 * 60) // one hour
  })
  return {
    filename: object.Key!,
    url: url
  }
}
