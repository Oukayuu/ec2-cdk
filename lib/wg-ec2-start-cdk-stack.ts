import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

interface ec2StartStackProps extends cdk.StackProps {
  users: { userName: string; key: string }[];
} 

export class Ec2CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: ec2StartStackProps) {
    super(scope, id,  props);

    // 既存のVPCを指定する
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      vpcId: "vpc-07b6b1c2e11515600",
    });

    // 既存のサブネットを指定する
    const subnet = ec2.Subnet.fromSubnetAttributes(this, "Subnet", {
      subnetId: "subnet-0501d5549d4ad604e",
      availabilityZone: "us-east-1a", // サブネットのアベイラビリティゾーンを指定
      routeTableId: "rtb-0274fc8a7cf2a6497", // サブネットのルートテーブルを指定
    });

    // 既存のセキュリティグループを指定する
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "ExistingSecurityGroup", "sg-07e7151e6f8bb2db7");

    // IAMロールを作成して、他のAWSサービスへのアクセスを許可する
    const role = new iam.Role(this, "ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // IAMポリシーをアタッチして、SSMへのアクセスを許可する
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // Amazon Linux 2のAMIを取得する
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // EC2インスタンスを作成する
    props?.users.forEach((user) => {
      new ec2.Instance(this, user.userName, {
        vpc,
        vpcSubnets: { subnets: [subnet] },
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ami,
        securityGroup: securityGroup,
        keyName: user.key,
        role: role,
      });
    });
  }
}