import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as WgEc2StartCdk from "../lib/wg-ec2-start-cdk-stack";
import * as AWS from "aws-sdk";
import * as fs from 'fs';

// AWS SDKの設定
AWS.config.update({ region: "us-east-1" });

// test("SQS Queue and SNS Topic Created", () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new WgEc2StartCdk.WgEc2StartCdkStack(app, "MyTestStack");
//   // THEN

//   const template = Template.fromStack(stack);

//   template.hasResourceProperties("AWS::SQS::Queue", {
//     VisibilityTimeout: 300,
//   });
//   template.resourceCountIs("AWS::SNS::Topic", 1);
// });

// EC2クライアントを作成
const ec2 = new AWS.EC2();

// キーペアを取得する関数
async function listKeyPairs() {
  try {
    const data = await ec2.describeKeyPairs().promise();
    return data.KeyPairs;
  } catch (error) {
    console.error("Error fetching key pairs:", error);
    throw error;
  }
}

// 新しいキーペアを作成する関数
async function createKeyPair(keyName: string) {
  try {
    const data = await ec2.createKeyPair({ KeyName: keyName }).promise();
    return data;
  } catch (error) {
    console.error("Error creating key pair:", error);
    throw error;
  }
}

type KeyPair = {
  KeyPairId: string,
  KeyFingerprint: string,
  KeyName: string,
  KeyType: 'rsa',
  Tags: [],
  CreateTime: string
}

test("list all the key pairs", async () => {
  try {
    // pairs.jsonを読み込む
    const pairsData = fs.readFileSync('pairs.json', 'utf-8');
    const expectedKeyPairs:KeyPair[] = JSON.parse(pairsData);

    // 現在のキーペアを取得
    const currentKeyPairs = await listKeyPairs();

    // 新規キーペアを作成する必要があるかチェック
    const keyPairsNeedCreating = expectedKeyPairs.filter((expectedKeyPair:KeyPair) => {
      return !currentKeyPairs!.some((currentKeyPair) => currentKeyPair.KeyName === expectedKeyPair.KeyName);
    });
    keyPairsNeedCreating.forEach(async (keyPair) => {
      await createKeyPair(keyPair.KeyName);
      console.log(`New key pair created: ${keyPair.KeyName}`);
    });

  } catch (error) {
    console.error("Error processing key pairs:", error);
  }
});
