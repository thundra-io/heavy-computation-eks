const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const HeavyComputationEks = require('../lib/heavy-computation-eks-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new HeavyComputationEks.HeavyComputationEksStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
