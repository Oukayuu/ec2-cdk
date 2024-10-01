import exp = require("constants");
import * as fs from "fs";

export type User = {
  name: string;
  email: string;
};

export type Prefix = {
  emailPrefix: string;
  emailPrefixNoNumber: string;
  emailPrefixNoNumberNoDot: string;
};



export function readUserData(path: string): User[] {
  // JSONファイルを読み込む
  const users = JSON.parse(fs.readFileSync(path, "utf8")).data;

  return users;
}
// usersからprefixesを取得する関数を定義
export function getEmailPrefixes(users: User[]): Prefix[] {
  const prefixes = users.map((user) => {
    const emailPrefix = user.email.split("@")[0];
    const emailPrefixNoNumber = emailPrefix.replace(/\d+$/, "");
    const emailPrefixNoNumberNoDot = emailPrefixNoNumber.replace(".", "");
    return { emailPrefix, emailPrefixNoNumber, emailPrefixNoNumberNoDot };
  });

  return prefixes;
}

