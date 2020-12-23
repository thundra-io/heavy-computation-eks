const cdk = require("@aws-cdk/core");
const eks = require("@aws-cdk/aws-eks");
const envVars = require("./env.vars.json");

class HeavyComputationEksStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, "heavy-computation", {
      version: eks.KubernetesVersion.V1_17,
    });

    // The backend service will be publicly accessible
    cluster.addManifest(
      "backend",
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: { name: "backend" },
        spec: {
          type: "LoadBalancer",
          selector: { app: "backend" },
          ports: [{ port: 8000 }],
        },
      },
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: { name: "backend" },
        spec: {
          selector: { matchLabels: { app: "backend" } },
          template: {
            metadata: { labels: { app: "backend" } },
            spec: {
              containers: [
                {
                  name: "backend",
                  image: "thundraio/hc-backend:latest",
                  ports: [{ containerPort: 8000 }],
                  env: [
                    ...envVars.thundra,
                    {
                      name: "THUNDRA_AGENT_APPLICATION_NAME",
                      value: "backend",
                    },
                  ],
                },
              ],
            },
          },
        },
      }
    );

    // The error service will be private to the cluster
    cluster.addManifest(
      "error",
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: { name: "error" },
        spec: { selector: { app: "error" }, ports: [{ port: 8000 }] },
      },
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: { name: "error" },
        spec: {
          selector: { matchLabels: { app: "error" } },
          template: {
            metadata: { labels: { app: "error" } },
            spec: {
              containers: [
                {
                  name: "error",
                  image: "thundraio/hc-error:latest",
                  ports: [{ containerPort: 8000 }],
                  env: [
                    ...envVars.thundra,
                    {
                      name: "THUNDRA_AGENT_APPLICATION_NAME",
                      value: "error",
                    },
                  ],
                },
              ],
            },
          },
        },
      }
    );

    // The calculator service will be private to the cluster
    cluster.addManifest(
      "calculator",
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: { name: "calculator" },
        spec: { selector: { app: "calculator" }, ports: [{ port: 8000 }] },
      },
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: { name: "calculator" },
        spec: {
          selector: { matchLabels: { app: "calculator" } },
          template: {
            metadata: { labels: { app: "calculator" } },
            spec: {
              containers: [
                {
                  name: "calculator",
                  image: "thundraio/hc-calculator:latest",
                  ports: [{ containerPort: 8000 }],
                  env: [
                    ...envVars.thundra,
                    {
                      name: "THUNDRA_AGENT_APPLICATION_NAME",
                      value: "calculator",
                    },
                  ],
                },
              ],
            },
          },
        },
      }
    );

    // The email service will be private and talk to AWS SES
    cluster.addManifest(
      "email",
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: { name: "email" },
        spec: { selector: { app: "email" }, ports: [{ port: 8000 }] },
      },
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: { name: "email" },
        spec: {
          selector: { matchLabels: { app: "email" } },
          template: {
            metadata: { labels: { app: "email" } },
            spec: {
              containers: [
                {
                  name: "email",
                  image: "thundraio/hc-email:latest",
                  ports: [{ containerPort: 8000 }],
                  env: [
                    ...envVars.thundra,
                    ...envVars.email,
                    { name: "THUNDRA_AGENT_APPLICATION_NAME", value: "email" },
                  ],
                },
              ],
            },
          },
        },
      }
    );

    const backendHostname = cluster.getServiceLoadBalancerAddress("backend");

    // An output to make testing easier
    new cdk.CfnOutput(this, "backendUrl", {
      exportName: "backend-url",
      description:
        'Use POST HTTP method with JSON body: {"email": "x@example.com", "number": 123}',
      value: cdk.Fn.join("", ["http://", backendHostname, ":8000/"]),
    });
  }
}

module.exports = { HeavyComputationEksStack };
