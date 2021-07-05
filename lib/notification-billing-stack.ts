import * as cdk from '@aws-cdk/core';
import * as logs from '@aws-cdk/aws-logs';
import * as lambdanodejs from '@aws-cdk/aws-lambda-nodejs';
import * as iam from '@aws-cdk/aws-iam';
import * as events from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from '@aws-cdk/aws-events-targets';

export class NotificationBillingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const slackIncomingWebhookUrl = process.env.SLACK_INCOMING_WEBHOOK_URL;
    const budgetName:any = process.env.BUDGET_NAME;

    // Create Lambda function
    const lambdaRole = new iam.Role(this, 'lambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'lambdaRole',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
      ],
    });

    const nodejsFunction = new lambdanodejs.NodejsFunction(
      this,
      'nodejsFunction',
      {
        entry: 'src/index.ts',
        handler: 'handler',
        minify: false,
        logRetention: logs.RetentionDays.ONE_WEEK,
        memorySize: 128,
        environment: {
          // @ts-ignore
          slackIncomingWebhookUrl: slackIncomingWebhookUrl,
          accountId: this.account,
          budgetName: budgetName
        },
        role: lambdaRole,
        deadLetterQueueEnabled: true
      }
    );

    const scheduleEvent = new events.Rule(this, 'scheduleEvent', {
      ruleName: 'lambda',
      enabled: true,
      schedule: events.Schedule.cron({
        minute: '30',
        hour: '14',
        day: '*',
        month: '*',
        year: '*',
      }),
      targets: [new targets.LambdaFunction(nodejsFunction)],
    });

    new lambda.CfnPermission(this, 'allowCloudwatchEvents', {
      action: 'lambda:InvokeFunction',
      functionName: nodejsFunction.functionName,
      principal: 'events.amazonaws.com',
      sourceArn: scheduleEvent.ruleArn,
    });
  }
}
