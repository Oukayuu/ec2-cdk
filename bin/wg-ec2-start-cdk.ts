#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Ec2CdkStack } from "../lib/wg-ec2-start-cdk-stack";
import * as path from "path";
import { user, readData } from "../lib/read-data";

// ルートフォルダのパスを取得
const rootDir = process.cwd();
// JSONファイルのパスを指定
const jsonFilePath = path.join(rootDir, "data", "iam-users.json");
// JSONファイルを読み込む
const users: user[] = readData(jsonFilePath);
// emailから@以前の文字列を抽出して配列に格納
const emailPrefixes: string[] = users.map((user) => user.email.split("@")[0]);

// 既存のリソースの情報を取得する（スタックに渡し用）
const existingResources = {
  vpc: {
    vpcId: "vpc-0282cec555c19e823",
    vpcName: "cloud-wg-handson1-vpc",
  },
  subnet: {
    subnetId: "subnet-018bf1606d353cb41",
    subnetName: "cloud-wg-handson1-subnet",
    availabilityZone: "ap-northeast-1a",
    routeTableId: "rtb-0528007b02e3b8363",
  },
  securityGroup: {
    securityGroupId: "sg-0c04aae620593c251",
    securityGroupName: "cloud-wg-handson1-sg",
  },
  iamRole: {
    roleArn: "arn:aws:iam::211125479140:role/ec2-ssm-role",
    roleName: "ec2-ssm-role",
  },
};

// 環境変数を取得
const myEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// スタックを作成
const app = new cdk.App();
new Ec2CdkStack(app, "WgEc2StartCdkStack", {
  env: myEnv,
  users: users,
  emailPrefixes: emailPrefixes,
  existingResources: existingResources,
});
