import { runWorkflow } from "./workflow-runner.js";

const scenarios = JSON.parse(open("../config/scenarios.json"));

export const options = {
  scenarios,
  thresholds: {
    http_req_duration: ["p(95)<200"],
    http_req_failed: ["rate<0.01"]
  }
};

export { runWorkflow };