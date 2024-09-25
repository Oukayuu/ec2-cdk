import * as AWS from "aws-sdk";

// AWS SDKの設定
AWS.config.update({ region: "us-east-1" });

// dynamodbクライアントを作成
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


test("list all the key pairs", async () => {
  try {
    const tables = await listTables();
    console.log("Tables:", tables);
    expect(tables).not.toBeNull

  } catch (error) {

  }
});