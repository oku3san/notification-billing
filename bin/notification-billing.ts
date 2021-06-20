#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NotificationBillingStack } from '../lib/notification-billing-stack';

const app = new cdk.App();
new NotificationBillingStack(app, 'NotificationBillingStack', {
});
