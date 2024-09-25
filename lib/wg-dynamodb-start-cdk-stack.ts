import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { user } from './read-data';

interface dynamodbStackProps extends cdk.StackProps {
  users: user[];
  emailPrefixes: string[];
} 

export class dynamodbCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: dynamodbStackProps) {
    super(scope, id,  props);

    // dynamodbのテーブルを作成する
    // グローバルセカンダリインデックスを作成する
    props.emailPrefixes.forEach((emailPrefix) => {
      new dynamodb.TableV2(this, `${emailPrefix}-Tasks`, {
        tableName: `${emailPrefix}-Tasks`,
        partitionKey: { name: "task_id", type: dynamodb.AttributeType.STRING },
        globalSecondaryIndexes: [
          {
            indexName: `search_key-index`,
            partitionKey: {
              name: "search_key",
              type: dynamodb.AttributeType.NUMBER,
            }
          },
        ],
      });
    });
  }
}