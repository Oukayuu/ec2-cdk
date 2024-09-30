/**
 * タスク登録API
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto"; // ユニークID生成用
import Joi from "joi"; // バリデーションライブラリ

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const tableName = process.env["tableName"];

let response;

// ユニークなIDを生成する関数（タスクIDをユニークに設定するため）
const generateUniqueId = () => {
  return randomBytes(16).toString("hex");
};

export const handler = async (event) => {
  // リクエストボディチェック(Lambdaプロキシ統合の場合はパースする必要あり)
  let body;
  try {
    if (typeof event.body === "string") {
      body = JSON.parse(event.body);
    } else if (typeof event.body === "object") {
      body = event.body;
    } else {
      throw new Error("Invalid request body");
    }
  } catch (err) {
    console.log("フォーマットエラー：", err);

    // レスポンス返却
    response = {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        result: "failure",
        message: "Warn 000005 リクエストが不正です。",
        timestamp: new Date().toISOString(),
      }),
    };
    return response;
  }

  console.log("タスク登録API START");

  const { task_name, description, deadline, task_status, search_key } = body;

  // バリデーションチェック (Joiを使用)
  const schema = Joi.object()
    .keys({
      task_name: Joi.string().required(),
      description: Joi.string().allow(""),
      deadline: Joi.string().allow(""),
      task_status: Joi.number().valid(1, 2).required(),
      search_key: Joi.number().valid(1).required(),
    })
    .unknown();
  let { error, value } = schema.validate(body, { abortEarly: false });
  if (error) {
    console.log("バリデーションエラー：", error.message);

    const sanitize = (str) => {
      return str ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    };

    // レスポンス返却
    response = {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify(
        getBody(
          new Date(),
          sanitize(value.task_name),
          sanitize(value.description),
          sanitize(value.deadline),
          sanitize(value.task_status),
          "error0001",
          error.message,
          0
        )
      ),
    };
    return response;
  }

  // 関数を用いてユニークなタスクIDを生成
  const task_id = generateUniqueId();

  // タスク登録処理
  let params = {
    TableName: tableName,
    Item: {
      task_id: task_id,
      task_name: task_name,
      description: description || "",
      deadline: deadline || "",
      task_status: task_status,
      search_key: search_key,
      deleted_at: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  const command = new PutCommand(params);
  try {
    await dynamodb.send(command);
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        result: "success",
        message: "タスク登録に成功しました。",
        timestamp: new Date().toISOString(),
        task_id: task_id,
        task_name: task_name,
        description: description,
        deadline: deadline,
        task_status: task_status,
        search_key: search_key,
      }),
    };
    return response;
  } catch (error) {
    console.error("Error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        result: "failure",
        message: "内部エラーメッセージ",
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

/**
 * レスポンスヘッダー
 * @method getHeaders
 */
function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Strict-Transport-Security": "max-age=31536000;",
    "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
    Pragma: "no-cache",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
  };
}

/**
 * レスポンスボディ
 * @method getBody
 * @param {String} now          現在日時
 * @param {String} task_id     タスクID
 * @param {String} task_name     タスク名
 * @param {String} description     説明
 * @param {String} deadline     期限
 * @param {Number} task_status     ステータス
 * @param {String} message_id   メッセージID
 * @param {String} message      メッセージ
 */
function getBody(
  now,
  task_name,
  description,
  deadline,
  task_status,
  message_id,
  message
) {
  // 日付フォーマット
  require("date-utils");

  return {
    update_date: new Date().toISOString(),
    task_name: task_name,
    description: description,
    deadline: deadline,
    task_status: task_status,
    message_id: message_id,
    message: message,
  };
}
