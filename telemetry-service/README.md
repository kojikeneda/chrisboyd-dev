# Telemetry Service for chrisboyd.dev

This is a lightweight Go service that collects telemetry data from the Hugo site and sends it to Dash0 using OpenTelemetry.

## Setup

1. Install Go 1.21 or later
2. Run the following command to install dependencies:

```bash
go mod tidy
```

3. Set the following environment variables:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingress.us-west-2.aws.dash0.com:4317"
export OTEL_EXPORTER_OTLP_PROTOCOL="grpc"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer YOUR_DASH0_API_KEY,Dash0-Dataset=default"
export OTEL_SERVICE_NAME="chrisboyd-blog"
```

Replace `YOUR_DASH0_API_KEY` with your actual Dash0 API key.

## Run the service

```bash
go run main.go
```

The service will start on port 8080 by default. You can change the port by setting the `PORT` environment variable.

## Deployment

You can deploy this service to any platform that supports Go applications:

- Google Cloud Run
- AWS Lambda with API Gateway
- Heroku
- Cloudflare Workers (with Go support)

After deploying, update the `telemetryEndpoint` in `static/js/telemetry.js` to point to your deployed service URL.

## Client-side integration

The Hugo site is already set up to send telemetry data to this service. The following files are responsible for this:

- `static/js/telemetry.js` - Client-side JavaScript that sends telemetry data
- `layouts/partials/extend_head.html` - Includes the telemetry script in the site

## Telemetry data

The service collects the following data:

- Page views
- Outbound link clicks
- URL, user agent, and referrer information

You can view this data in your Dash0 dashboard. 