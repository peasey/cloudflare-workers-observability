# API observability for Cloudflare Workers

This repo contains a proof of concept for observability in Cloudflare Workers using AWS CloudWatch. In this repo an observability abstraction is created to capture logs and generate metrics that are flushed to an observability endpoint at the end of each request.

There is an [accompanying blog post](https://blog.peasey.co.uk/blog/api-observability-for-cloudflare-workers).

## Configuration

The configuration is handled by `dotenv` so the first thing you need to do is add a .env file to the root of the repo with the following environment variables:

| Variable              | Comment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLOUDFLARE_ACCOUNT_ID | This should be set to your Cloudflare **Account ID** and can be found in the _Overview_ page under the _API_ section in the Cloudflare dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CLOUDFLARE_ZONE_ID    | This should be set to your Cloudflare **Zone ID** and can be found in the _Overview_ page under the _API_ section in the Cloudflare dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CLOUDFLARE_AUTH_KEY   | This should be set to your API key which you can find in the Cloudflare dashboard under the _API_ section and then _Get your API token_ -> _API tokens_ tab -> _Global API Key_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CLOUDFLARE_AUTH_EMAIL | This should be set to the email address you use to sign into your Cloudflare account.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| HOST                  | This should be set to the API host you want to use in your routes, i.e. api.somewhere.com.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ENVIRONMENT           | This should be set to the logical environment you are deploying to in the physical account. It defaults to 'prod', and when the environment is 'prod', it deploys the route at the root of the host (above), i.e. api.somewhere.com/my/route*. When you specify an environment other than 'prod', the routes are deployed using the environment as a suffix on the host and prefix to the route, i.e. api.somewhere.com/env/my/route*. This is useful if you want multiple logical environments in a single account, i.e. many developers working in a development account (api.devsite.com/alex/my/route*) or for deploying PRs as part of CI/CD processes etc (api.devsite.com/pr32/my/route*). |
| AWS_REGION            | Standard AWS environment variable to specify the region for your resources.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| AWS_ACCESS_KEY_ID     | Standard AWS environment variable to specify the identity of the secret key you want to use for API operations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| AWS_SECRET_ACCESS_KEY | Standard AWS environment variable to specify the secret key for API operations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

<br>

> Note: You need to ensure you have the required DNS records and TLS certs configured. For example, if your HOST is api.somewhere.com, you need the following DNS A records for the _somewhere.com_ domain to support api.somewhere.com, blue.api.somewhere.com and green.api.somewhere.com, your TLS cert should also have those domains as alternative names, or be a wildcard cert.

## Installation

```bash
> npm install
```

## Running

I've created some npm scripts to simplify the commands when wrapped with configuration. Replace _somewhere.com_ with the host you configured in the **.env** file below:

### Deploy AWS resources:

```bash
> npm run deploy:aws
```

### Deploy Cloudflare resources:

```bash
> npm run deploy
```

### Run the load test features in the blog post:

```bash
> npm run load
```

### Remove AWS resources:

```bash
> npm run remove:aws
```

### Remove CloudFlare resources:

```bash
> npm run remove
```

> See the repos from the other blog posts in this series for information on the blue/green deployment and an enhanced developer experience aspects this repo builds on top of.
>
> - [Blue / Green deployments for Cloudflare Workers](https://github.com/peasey/cloudflare-workers-blue-green-poc)
> - [Enhancing the development experience for Cloudflare Workers](https://github.com/peasey/cloudflare-workers-local-dev-poc)
> - [A middleware architecture for Cloudflare Workers](https://github.com/peasey/cloudflare-workers-middleware)
