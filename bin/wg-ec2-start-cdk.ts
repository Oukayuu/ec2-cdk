#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Ec2CdkStack } from "../lib/wg-ec2-start-cdk-stack";
import * as path from "path";
import { User, readUserData, Prefix, getEmailPrefixes } from "../lib/read-data";
import { dynamodbCdkStack } from "../lib/wg-dynamodb-start-cdk-stack";
import AWS = require("aws-sdk");
import { LambdaCdkStack } from "../lib/wg-lambda-cdk-stack";

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
const users: User[] = readUserData(userJsonFilePath);
// usersからprefixesを取得
const prefixes: Prefix[] = getEmailPrefixes(users);

const dynamodb = new AWS.DynamoDB();
const lambda = new AWS.Lambda();

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

// Lambda関数名を取得する関数を定義
async function listLambdaFunctions() {
  try {
    const data = await lambda.listFunctions().promise();

    // dataからFunction名のみを取得
    const functionNames = data.Functions?.map((func) => func.FunctionName);
    return functionNames;
  } catch (error) {
    console.error("Error fetching lambda functions:", error);
    throw error;
  }
}

// lambdaPrefixesToCreateを取得する関数を定義
async function getLambdaPrefixesToCreate(): Promise<Prefix[]> {
  const lambdaFunctionNames = await listLambdaFunctions();

  if (lambdaFunctionNames) {
    // prefixを取得(例：wangjiayu)
    const lambdaPrefixesFinished = lambdaFunctionNames.map(
      (functionName) => functionName?.split("-")[0]
    );

    // prefixesをロープして、lambdaPrefixesFinishedに含まれていないprefixを取得し、Prefix[]タイプとして出力、prefixesToCreateに格納
    const lambdaPrefixesToCreate: Prefix[] = prefixes.filter(
      (prefix) =>
        !lambdaPrefixesFinished.includes(prefix.emailPrefixNoNumberNoDot)
    );

    // 既存のdynanodbテーブル名を取得
    const tableNameFinished = await listTables();

    // テーブル名の-Tasksを削除して、tableNameNoDotに格納
    const dynamodbPrefixesFinished = tableNameFinished!.map(
      (tableName) => tableName.split("-")[0]
    );
    //"."を削除して、dynamodbPrefixesFinishedに格納
    const dynamodbPrefixesFinishedNoDot = dynamodbPrefixesFinished.map(
      (prefix) => prefix.replace(".", "")
    );

    // lambdaPrefixesToCreateの中に、lambdaPrefixesToCreate.emailPrefixNoNumberNoDotがdynamodbPrefixesFinishedNoDot元素に前方一致のものを取得
    const lambdaPrefixesToCreateFiltered = lambdaPrefixesToCreate.filter(
      (prefix) =>
        dynamodbPrefixesFinishedNoDot.some((dynamodbPrefix) =>
          dynamodbPrefix.startsWith(prefix.emailPrefixNoNumberNoDot)
        )
    );

    return lambdaPrefixesToCreateFiltered;
  } else {
    console.log("No lambda function names found.");
    return [];
  }
}

// 関数を呼び出して結果を利用
getLambdaPrefixesToCreate()
  .then((lambdaPrefixesToCreateFiltered) => {
    console.log("Lambda prefixes to create:", lambdaPrefixesToCreateFiltered);
    // 環境変数を取得
    const myEnv = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    };

    // スタックを作成
    const app = new cdk.App();
    new LambdaCdkStack(app, "LambdaCdkStack", {
      env: myEnv,
      users: users,
      prefixes: lambdaPrefixesToCreateFiltered,
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// emailPrefixesToCreateを取得する関数を定義
// async function getEmailPrefixesToCreate(): Promise<string[]> {
//   const tableNameFinished = await listTables();

//   if (tableNameFinished) {
//     // prefixを取得
//     const dynamodbPrefixesFinished = tableNameFinished.map((tableName) => tableName.split("-")[0]);

//     // dynamodbPrefixesFinishedに含まれていないemailPrefixesを取得
//     const emailPrefixesToCreate = emailPrefixes.filter(
//       (emailPrefix) => !dynamodbPrefixesFinished.includes(emailPrefix)
//     );

//     return emailPrefixesToCreate;
//   } else {
//     console.log("No table names found.");
//     return [];
//   }
// }

// 関数を呼び出して結果を利用
// getEmailPrefixesToCreate()
//   .then((emailPrefixesToCreate) => {
//     console.log("Email prefixes to create:", emailPrefixesToCreate);
//     // 環境変数を取得
//     const myEnv = {
//       account: process.env.CDK_DEFAULT_ACCOUNT,
//       region: process.env.CDK_DEFAULT_REGION,
//     };

//     // emailPrefixesToCreate内の"."を"-"に置換
//     emailPrefixesToCreate.forEach((emailPrefix, index) => {
//       emailPrefixesToCreate[index] = emailPrefix.replace(".", "-");
//     });

//     // スタックを作成
//     const app = new cdk.App();
//     // new Ec2CdkStack(app, "WgEc2StartCdkStack", {
//     //   env: myEnv,
//     //   users: users,
//     //   emailPrefixes: emailPrefixes,
//     //   existingResources: existingResources,
//     // });
//     // new dynamodbCdkStack(app, "WgDynamodbStartCdkStack", {
//     //   env: myEnv,
//     //   users: users,
//     //   emailPrefixes: emailPrefixesToCreate,
//     // });
//     new LambdaCdkStack(app, "LambdaCdkStack", {
//       env: myEnv,
//       users: users,
//       emailPrefixes: emailPrefixesToCreate,
//     });
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });

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
