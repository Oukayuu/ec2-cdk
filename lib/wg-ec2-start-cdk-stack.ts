import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { user } from "../lib/read-data";

interface ec2StartStackProps extends cdk.StackProps {
  users: user[];
  emailPrefixes: string[];
  existingResources: {
    vpc: any;
    subnet: any;
    securityGroup: any;
    iamRole: any;
  };
}

export class Ec2CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: ec2StartStackProps) {
    super(scope, id, props);

    // 既存のVPCを指定する
    const vpc = ec2.Vpc.fromLookup(this, props?.existingResources.vpc.vpcName, {
      vpcId: props?.existingResources.vpc.vpcId,
    });

    // 既存のサブネットを指定する
    const subnet = ec2.PublicSubnet.fromSubnetAttributes(
      this,
      props?.existingResources.subnet.subnetName,
      {
        subnetId: props?.existingResources.subnet.subnetId, // サブネットIDを指定
        availabilityZone: props?.existingResources.subnet.availabilityZone, // サブネットのアベイラビリティゾーンを指定
        routeTableId: props?.existingResources.subnet.routeTableId, // サブネットのルートテーブルを指定
      }
    );

    // 既存のセキュリティグループを指定する
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      props?.existingResources.securityGroup.securityGroupName,
      props?.existingResources.securityGroup.securityGroupId
    );

    // 既存のIAMロールを取得して、EC2インスタンスにアタッチする
    const role = iam.Role.fromRoleArn(
      this,
      props?.existingResources.iamRole.roleName,
      props?.existingResources.iamRole.roleArn
    );

    // Amazon Linux 2023のAMIを取得する
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // ユーザーデータを作成
    const userData = ec2.UserData.forLinux({ shebang: "#!/bin/bash" });
    userData.addCommands(
      "sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm"
    );

    // EC2インスタンスを作成する
    props?.emailPrefixes.forEach((emailPrefix) => {
      new ec2.Instance(this, `${emailPrefix}-Docker`, {
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ami,
        securityGroup: securityGroup,
        role: role,
        userData: userData,
        associatePublicIpAddress: true,
      });
    });
  }
}
