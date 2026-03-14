import http from "k6/http";
import { getAuthHeaders } from "./auth.js";
import { getPayload } from "./payload-generator.js";

const workflows = JSON.parse(open("../config/workflows.json"));

const baseUrl = __ENV.BASE_URL;

function callEndpoint(step) {

  const headers = getAuthHeaders();

  const url = baseUrl + step.path.replace("{{id}}", "1");

  const payload = getPayload(step.method, step.path);

  if (payload) {

    http.request(step.method, url, payload, { headers });

  } else {

    http.request(step.method, url, null, { headers });

  }

}

function getWorkflowSteps(workflowName) {

  const selectedWorkflow = workflows[workflowName];

  if (!Array.isArray(selectedWorkflow) || selectedWorkflow.length === 0) {
    throw new Error(`Workflow '${workflowName}' is not defined in config/workflows.json`);
  }

  return selectedWorkflow;

}

export function runWorkflow() {

  const fallbackWorkflow = Object.keys(workflows)[0];
  const workflowName = __ENV.WORKFLOW_NAME || fallbackWorkflow;
  const steps = getWorkflowSteps(workflowName);

  steps.forEach(callEndpoint);

}