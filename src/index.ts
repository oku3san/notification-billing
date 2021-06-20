import * as slack from '@slack/webhook';
import * as aws from 'aws-sdk';

const slackIncomingWebhookUrl = process.env.slackIncomingWebhookUrl;
const accountId = process.env.accountId;
const budgetName = process.env.budgetName;
const budgets = new aws.Budgets();
const params = {
  AccountId: accountId,
  BudgetName: budgetName,
};

// @ts-ignore
const webhook = new slack.IncomingWebhook(slackIncomingWebhookUrl);
let messages = '';

exports.handler = () => {
  budgets.describeBudget(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      const result = data;
      const actualAmount: string =
        // @ts-ignore
        result.Budget.CalculatedSpend.ActualSpend.Amount;
      const forecastedAmount: string =
        // @ts-ignore
        result.Budget.CalculatedSpend.ForecastedSpend.Amount;
      messages =
        '実績値は $' + actualAmount + '、予測値は $' + forecastedAmount;

      void webhook.send({
        text: messages,
      });
    }
  });
};
