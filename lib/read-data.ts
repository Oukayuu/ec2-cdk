import * as fs from "fs";

export type user = {
  email: string;
  name: string;
};

export function readData(path: string): user[] {
  // JSONファイルを読み込む
  const users = JSON.parse(fs.readFileSync(path, "utf8")).data;

  return users;
}
