# SSMからアクセス可能な複数EC2インスタンスを起動するCDK
---
## 利用条件
- 既存のVPC、パブリックサブネット、セキュリティグループ、IAMロールがあること
- Cloud9サーバーから、AWSアカウントにアクセスできる権限が付与されていること（IP制限を外していること）
- IAMユーザーに、Cloud9環境を利用するための権限が付与されていること
- IAMユーザーに、CDK(CloudFormation)を利用するための権限が付与されていること
---
## 利用手順
### 環境構築
  1. Cloud9サーバーを起動する
    （デフォルトの設定で問題ないが、早くデプロイできるように、今回はt2.microではなく、t3.smallを使用した）
  2. Cloud9サーバーにログインする
  3. コンソール上に`git clone https://github.com/Oukayuu/ec2-cdk.git`コマンドを実行して、本リポジトリをCloud9サーバーにダウンロードする(コンソールが表示されていない時はF6を押す)
  4. `cd EC2-CDK`コマンドを実行して、ディレクトリを移動する
  5. `npm ci`コマンドを実行して、必要なモジュールをインストールする
### デプロイ
  1. デプロイしたいリソースに合わせて、`./data/iam-users.json`ファイルを編集する
      ```json
      {
        "data": [
          {
            "email": "yokohama.hanako@gmail.com",
            "name": "横浜 花子"
          },
          {
            "email": "tokyou.taro@gmail.com",
            "name": "東京 太郎"
          },
          ......
        ]
      }
      ```
  2. 既存リソースの情報の元で、wg-ec2-start-cdk-stack.tsファイルを編集する
   (ソースコードはハードコーディングされているが、実際に合わせて修正が必要) 
   **※各リソースの情報は、AWSマネジメントコンソールから取得する**
     1. 既存VPCの情報を編集する
      ```json
      {
        "vpc": {
          "vpcId": "vpc-xxxx",  // 既存VPCのID
          "vpcName": "xxxxx"   // 既存VPCの名前
        }
      }
      ```
     2. 既存サブネットの情報を編集する
      ```json
      {
        "subnet": {
          "subnetId": "subnet-xxxx",  // 既存サブネットのID
          "subnetName": "xxxxx",   // 既存サブネットの名前
          "availabilityZone": "ap-northeast-1xxxx", // 既存サブネットのAZ
          "routeTableId": "rtb-xxxxx", // 既存サブネットのルートテーブルID
        }
      }
      ```
     3. 既存セキュリティグループの情報を編集する
      ```json
      {
        "securityGroup": {
          "securityGroupId": "sg-xxxxx",  // 既存セキュリティグループのID
          "securityGroupName": "xxxxx"   // 既存セキュリティグループの名前
        }
      }
      ```
     4. 既存IAMロールの情報を編集する
      ```json
      {
        "iamRole": {
          "roleArn": "arn:aws:iam::xxxxx:role/xxxxx",   // 既存IAMロールのARN
          "roleName": "xxxxx"  // 既存IAMロールの名前
        }
      }
      ```
      5. スタック名を編集する(同じスタック名でデプロイするとエラーが発生する)
      ```typescript
        new Ec2CdkStack(app, "stackName-xxxxx", {
          env: myEnv,
          users: users,
          emailPrefixes: emailPrefixes,
          existingResources: existingResources,
        });
      ```
  3. 編集したファイル(.json,.ts)を保存する
  4.  `cdk synth`コマンドを実行して、CloudFormationテンプレートを生成する
  5.  `cdk deploy [スタック名]`コマンドを実行して、スタックをデプロイする
  6.  デプロイが完了したら、SSMからアクセス可能なEC2インスタンスが起動されていることを確認する

### リソース削除
  1. `cdk destroy [スタック名]`コマンドを実行して、スタックを削除する
  2. 削除が完了したら、CloudFormationスタックが削除されていることを確認する


---
## 参考記事
- Cloud9の開始方法
  https://aws.amazon.com/jp/cloud9/getting-started/
- AWS CDKでEC2をデプロイする
  https://qiita.com/Brutus/items/bba6a49a1a05c3277673
- SSMでアクセス可能なEC2をCDKで作成する
  https://zenn.dev/gsy0911/articles/5bb915ef331d1f

---
## ツール
- ExcelからJSONに変換するツール
  https://tableconvert.com/ja/excel-to-json
---
# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`WgEc2StartCdkStack`)

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
