import * as cdk from 'aws-cdk-lib'
import { Ec2Action } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface NetworkingProps {
    maxAzs: number;
}

export class Networking extends Construct {

    public readonly vpc:ec2.IVpc;

    constructor(scope: Construct, id: string, props: NetworkingProps) {
        super(scope, id);

        new ec2.Vpc(this, 'TomsVPC', {
            cidr: '10.0.0.0/16',
            maxAzs: props.maxAzs,
            subnetConfiguration: [
               {
                 cidrMask: 24,
                 name: 'TomsIngressPublic',
                 subnetType: ec2.SubnetType.PUBLIC,
               },
               {
                 cidrMask: 24,
                 name: 'TomsPrivate',
                 subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
               }
            ]
         });

    }
}