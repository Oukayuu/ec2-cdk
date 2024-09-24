import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface dynamodbStackProps extends cdk.StackProps {
  users: { userName: string; key: string }[];
} 

export class dynamodbCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: dynamodbStackProps) {
    super(scope, id,  props);

    // dynamodbのテーブルを作成する
    // グローバルセカンダリインデックスを作成する
    props.users.forEach((user) => {
      new dynamodb.TableV2(this, `${user.userName}-Table`, {
        tableName: `${user.userName}-Table`,
        partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
        globalSecondaryIndexes: [
          {
            indexName: `${user.userName}-Table-GSI`,
            partitionKey: { name: "name", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "age", type: dynamodb.AttributeType.NUMBER },
          },
        ],
      })
    });
  }
}