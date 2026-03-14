# Load Test Harness

This repository generates a k6-based load test harness from an OpenAPI or Swagger document.

It pulls an API spec, derives endpoint metadata and auth configuration, builds request payload templates, and runs scenario-based API tests against a target service.

## What It Does

- Downloads a Swagger or OpenAPI document into `swagger/swagger.json`.
- Detects supported auth schemes and writes `config/auth.json`.
- Converts API paths into runnable endpoint definitions in `config/endpoints.json`.
- Builds workflow groupings in `config/workflows.json`.
- Creates scenario definitions in `config/scenarios.json`.
- Generates JSON request payload templates in `config/payloads.json`.
- Runs k6 against the generated configuration.

## Repository Layout

```text
config/      Generated runtime configuration files
generator/   Scripts that derive test assets from the API spec
k6/          k6 runtime scripts and helpers
swagger/     Downloaded API specification
run.sh       End-to-end generation + test entrypoint
```

## Prerequisites

- Node.js 20+ with ESM support
- npm
- k6 installed and available on your `PATH`

Install JavaScript dependencies:

```bash
npm install
```

## Required Environment Variables

Set the API spec location and the target API base URL before generating or running tests.

```bash
export SWAGGER_URL="https://your-api.example.com/swagger/v1/swagger.json"
export BASE_URL="https://your-api.example.com"
```

If your API requires authentication, set one or both of these depending on the detected security scheme:

```bash
export API_KEY="your-api-key"
export TOKEN="your-bearer-token"
```

Auth behavior is generated from the spec:

- HTTP bearer schemes map to `Authorization: Bearer $TOKEN`
- API key schemes map to the header name defined in the spec using `$API_KEY`

## Quick Start

Run the full generation and test pipeline:

```bash
./run.sh
```

That script performs these steps:

1. Fetch the API spec.
2. Detect auth schemes.
3. Generate endpoints.
4. Generate workflows.
5. Generate scenarios.
6. Generate payload templates.
7. Run k6.

## Manual Workflow

If you want to inspect each stage, run the scripts individually:

```bash
npm run fetch-swagger
npm run detect-auth
npm run generate-endpoints
npm run generate-workflows
npm run generate-scenerios
node generator/generate-payloads.js
k6 run k6/test.js
```

## How API Testing Works

The main k6 entrypoint is `k6/test.js`. It loads scenario definitions from `config/scenarios.json` and executes named flows from `k6/workflow-runner.js`.

The generated flows currently work like this:

- Each OpenAPI tag becomes a workflow in `config/workflows.json`
- Every endpoint is added to the workflow that matches each of its tags
- Untagged endpoints fall back into a `default` workflow

For each step, the runner:

- Builds headers from generated auth config
- Replaces `{{id}}` path placeholders with a fixed test value
- Loads a generated payload from `config/payloads.json` when the endpoint has a JSON request body
- Sends the HTTP request with k6

Scenario generation is also dynamic:

- `generator/generate-scenerios.js` creates one k6 scenario per generated workflow
- Each scenario uses the generic `runWorkflow` executor and passes the workflow name through scenario env
- Rate and pre-allocated VUs are distributed proportionally to the number of endpoints in each workflow

## Generated Files

These files are generated and ignored by git:

- `swagger/swagger.json`
- `config/auth.json`
- `config/endpoints.json`
- `config/workflows.json`
- `config/scenarios.json`
- `config/payloads.json`

You can inspect these after generation to verify the harness matches your API.

## Customizing Tests

### Tune load scenarios

Edit `generator/generate-scenerios.js` if you want different defaults for:

- request rate
- duration
- pre-allocated virtual users
- executed workflow name

You can also edit `config/scenarios.json` directly after generation for quick experiments.

### Change workflow grouping

`generator/generate-workflows.js` derives workflow names from the tags in your Swagger or OpenAPI document.

If you want different grouping behavior, edit that generator to merge tags, exclude operations, or group by another field such as the first path segment.

### Adjust endpoint selection

Edit `generator/generate-endpoints.js` to change default weights, path transformations, or tag handling.

### Improve payload generation

Edit `generator/generate-payloads.js` if your schemas require custom examples, reference resolution logic, or payload overrides.

## Running Only k6

If the config files have already been generated, you can rerun the test without regenerating assets:

```bash
k6 run k6/test.js
```

## Troubleshooting

### `SWAGGER_URL` is missing or invalid

The fetch step requires a reachable Swagger or OpenAPI JSON URL. Verify the URL and that it returns JSON.

### `403 Forbidden` while downloading swagger

The swagger endpoint may require network access, VPN access, auth, or a different URL than the one you configured.

### `payloads.json` is missing

Run:

```bash
node generator/generate-payloads.js
```

If generation skips some schemas, those endpoints likely use unsupported schema shapes or non-JSON request bodies.

### k6 sends requests with no auth

Check `config/auth.json` after running `npm run detect-auth` and confirm the required `API_KEY` or `TOKEN` environment variables are set.

## Notes

- `config/*` and `swagger/*` are generated artifacts and are intentionally ignored in git.
- The npm script name `generate-scenerios` is intentionally spelled to match the current repository script definition.
- This harness is designed for load and workflow testing, not assertion-heavy functional API validation.