#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Ec2CdkStack } from "../lib/wg-ec2-start-cdk-stack";
import * as path from "path";
import { user, readUserData ,readDynamodbNameList, dynamodbNameList} from "../lib/read-data";
import { dynamodbCdkStack } from "../lib/wg-dynamodb-start-cdk-stack";
import AWS = require("aws-sdk");

const credentials = new AWS.SharedIniFileCredentials({
  profile: "default",
});
AWS.config.credentials = credentials;
// AWS.config.update({ region: "ap-northeast-1" });

// ルートフォルダのパスを取得
const rootDir = process.cwd();
// JSONファイルのパスを指定
const userJsonFilePath = path.join(rootDir, "data", "iam-users.json");
// JSONファイルを読み込む
const users: user[] = readUserData(userJsonFilePath);
// emailから@以前の文字列を抽出して配列に格納
const emailPrefixes: string[] = users.map((user) => user.email.split("@")[0]);

const dynamodb = new AWS.DynamoDB();

// dynamodbテーブル名を取得する関数を定義
async function listTables() {
  try {
    const data = await dynamodb.listTables().promise();
    return data.TableNames;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
}

// dynamodbテーブル名を取得
const tableNameFinished = listTables();

// 既に登録済のテーブル名を取得
// const tableNameJsonFilePath = path.join(rootDir, "data", "dynamodb-name-list.json");
// // JSONファイルを読み込む
// const tableNames: dynamodbNameList[] = readDynamodbNameList(tableNameJsonFilePath);
// prefixを取得
// emailPrefixesToCreateを取得する関数を定義
async function getEmailPrefixesToCreate(): Promise<string[]> {
  const tableNameFinished = await listTables();

  if (tableNameFinished) {
    // prefixを取得
    const emailPrefixesFinished = tableNameFinished.map((tableName) => tableName.split("-")[0]);

    // emailPrefixesFinishedに含まれていないemailPrefixesを取得
    const emailPrefixesToCreate = emailPrefixes.filter(
      (emailPrefix) => !emailPrefixesFinished.includes(emailPrefix)
    );

    return emailPrefixesToCreate;
  } else {
    console.log("No table names found.");
    return [];
  }
}

// 関数を呼び出して結果を利用
getEmailPrefixesToCreate().then((emailPrefixesToCreate) => {
  console.log("Email prefixes to create:", emailPrefixesToCreate);
  // 環境変数を取得
  const myEnv = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  };
  
  // スタックを作成
  const app = new cdk.App();
  // new Ec2CdkStack(app, "WgEc2StartCdkStack", {
  //   env: myEnv,
  //   users: users,
  //   emailPrefixes: emailPrefixes,
  //   existingResources: existingResources,
  // });
  new dynamodbCdkStack(app, "WgDynamodbStartCdkStack", {
    env: myEnv,
    users: users,
    emailPrefixes: emailPrefixesToCreate,
  });
}).catch((error) => {
  console.error("Error:", error);
});

// 既存のリソースの情報を取得する（スタックに渡し用）
// const existingResources = {
//   vpc: {
//     vpcId: "vpc-0282cec555c19e823",
//     vpcName: "cloud-wg-handson1-vpc",
//   },
//   subnet: {
//     subnetId: "subnet-018bf1606d353cb41",
//     subnetName: "cloud-wg-handson1-subnet",
//     availabilityZone: "ap-northeast-1a",
//     routeTableId: "rtb-0528007b02e3b8363",
//   },
//   securityGroup: {
//     securityGroupId: "sg-0c04aae620593c251",
//     securityGroupName: "cloud-wg-handson1-sg",
//   },
//   iamRole: {
//     roleArn: "arn:aws:iam::211125479140:role/ec2-ssm-role",
//     roleName: "ec2-ssm-role",
//   },
// };

