#!/usr/bin/env node

const cdk = require("@aws-cdk/core");
const {
  HeavyComputationEksStack,
} = require("../lib/heavy-computation-eks-stack");

const app = new cdk.App();
new HeavyComputationEksStack(app, "HeavyComputationEksStack");
