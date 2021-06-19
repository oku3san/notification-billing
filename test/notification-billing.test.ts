import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as NotificationBilling from '../lib/notification-billing-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new NotificationBilling.NotificationBillingStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
