import fs from "fs";

const workflows = JSON.parse(fs.readFileSync("./config/workflows.json"));

const workflowEntries = Object.entries(workflows).filter(([, steps]) => Array.isArray(steps) && steps.length > 0);
const totalWeight = workflowEntries.reduce((sum, [, steps]) => sum + steps.length, 0) || 1;
const totalRate = 25000;
const totalPreAllocatedVUs = 800;

const scenarios = Object.fromEntries(workflowEntries.map(([workflowName, steps]) => {

  const proportionalRate = Math.max(1, Math.round((totalRate * steps.length) / totalWeight));
  const proportionalVUs = Math.max(1, Math.round((totalPreAllocatedVUs * steps.length) / totalWeight));

  return [`${workflowName}_users`, {
    executor: "constant-arrival-rate",
    rate: proportionalRate,
    timeUnit: "1s",
    duration: "30s",
    preAllocatedVUs: proportionalVUs,
    exec: "runWorkflow",
    env: {
      WORKFLOW_NAME: workflowName
    }
  }];

}));

if (Object.keys(scenarios).length === 0) {
  throw new Error("No workflows were generated. Generate workflows before generating scenarios.");
}

fs.writeFileSync("./config/scenarios.json", JSON.stringify(scenarios, null, 2));

console.log("Scenarios generated");