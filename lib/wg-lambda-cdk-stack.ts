import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Prefix, User } from "./read-data";
import * as iam from "aws-cdk-lib/aws-iam";
import path = require("path");

interface lambdaStackProps extends cdk.StackProps {
  users: User[];
  prefixes: Prefix[];
}

// lambda関数を作成する
export class LambdaCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: lambdaStackProps) {
    super(scope, id, props);

    // 既存のロールを取得
    const role = iam.Role.fromRoleArn(
      this,
      "Sample-LambdaRole ",
      "arn:aws:iam::211125479140:role/Sample-LambdaRole"
      // "arn:aws:iam::224612091524:role/Sample-LambdaRole"
    );

    // 既存のレイヤーを取得
    const layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "node_modules",
      "arn:aws:lambda:ap-northeast-1:211125479140:layer:node_modules:1"
    );

    props.prefixes.forEach((prefix) => {
      new lambda.Function(this, `${prefix.emailPrefixNoNumberNoDot}-taskRegister`, {
        functionName: `${prefix.emailPrefixNoNumberNoDot}-taskRegister`,
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../src/task-register")
        ),
        handler: "index.handler",
        environment: {
          tableName: `${prefix.emailPrefix}-Tasks`,
        },
        role: role,
        layers: [layer],
      });
    });
  }
}
