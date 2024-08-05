# SSMからアクセス可能な複数EC2インスタンスを起動するCDK
---
## 利用条件
- 既存のVPC、パブリックサブネット、セキュリティグループがあること
- Cloud9サーバーから、AWSアカウントにアクセスできる権限が付与されていること（IP制限を外していること）
- IAMユーザーに、Cloud9環境を利用するための権限が付与されていること
- IAMユーザーに、CDK(CloudFormation)を利用するための権限が付与されていること
---
## 利用手順
### 環境構築
  1. Cloud9サーバーを起動する
  2. Cloud9サーバーにログインする
  3. `git clone https://github.com/Oukayuu/ec2-cdk.git`コマンドを実行して、本リポジトリをCloud9サーバーにダウンロードする
  4. `cd EC2-CDK`コマンドを実行して、ディレクトリを移動する
  5. `npm ci`コマンドを実行して、必要なモジュールをインストールする
  6. デプロイしたいリソースに合わせて、jsonファイルを編集する
  7. `cdk synth`コマンドを実行して、CloudFormationテンプレートを生成する
  8. `cdk deploy [スタック名]`コマンドを実行して、スタックをデプロイする
  9. デプロイが完了したら、SSMからアクセス可能なEC2インスタンスが起動されていることを確認する

### リソース削除
  1. `cdk destroy [スタック名]`コマンドを実行して、スタックを削除する
  2. 削除が完了したら、CloudFormationスタックが削除されていることを確認する


---
## 参考記事

## ツール


# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`WgEc2StartCdkStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
