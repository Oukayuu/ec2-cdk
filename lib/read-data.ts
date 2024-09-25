import exp = require("constants");
import * as fs from "fs";

export type user = {
  name: string;
  email: string;
};

export type dynamodbNameList = {
  tableName: string;
};

export function readUserData(path: string): user[] {
  // JSONファイルを読み込む
  const users = JSON.parse(fs.readFileSync(path, "utf8")).data;

  return users;
}

export function readDynamodbNameList(path: string): dynamodbNameList[] { 
  // JSONファイルを読み込む
  const dynamodbNameList = JSON.parse(fs.readFileSync(path, "utf8")).data;
  return dynamodbNameList;
}