import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { user } from "./read-data";
import * as iam from "aws-cdk-lib/aws-iam";
import { aws_lambda_nodejs } from "aws-cdk-lib";
import path = require("path");

interface lambdaStackProps extends cdk.StackProps {
  users: user[];
  emailPrefixes: string[];
}

// lambda関数を作成する
export class lambdaCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: lambdaStackProps) {
    super(scope, id, props);

    // 既存のロールを取得
    const role = iam.Role.fromRoleArn(
      this,
      "Sample-LambdaRole ",
      "arn:aws:iam::211125479140:role/Sample-LambdaRole"
    );

    // 既存のレイヤーを取得
    const layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "node_modules",
      "arn:aws:lambda:ap-northeast-1:211125479140:layer:node_modules:1"
    );

    props.emailPrefixes.forEach((emailPrefix) => {
      new aws_lambda_nodejs.NodejsFunction(
        this,
        `${emailPrefix}-taskRegister`,
        {
          functionName: `${emailPrefix}-taskRegister`,
          runtime: lambda.Runtime.NODEJS_20_X,
          entry: path.join(__dirname, "../src/task-register/index.mjs"),
          handler: "handler",
          environment: {
            tableName: `${emailPrefix}-Tasks`,
          },
          role: role,
          layers: [layer],
        }
      );
    });
  }
}
