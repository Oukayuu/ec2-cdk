#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Ec2CdkStack } from '../lib/wg-ec2-start-cdk-stack';

const users = [
    {
        userName: "oukayuu",
        key: "oukayuu-ssh-test-key"
    },
    {
        userName: "oukayuu2",
        key: "key-oukayuu-mac"
    }
]

const myEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:process.env.CDK_DEFAULT_REGION
}

const app = new cdk.App();
new Ec2CdkStack(app, 'WgEc2StartCdkStack',{env:myEnv,users:users});
