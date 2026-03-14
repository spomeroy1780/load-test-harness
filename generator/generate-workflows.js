import fs from "fs";

const swagger = JSON.parse(fs.readFileSync("./swagger/swagger.json"));
const endpoints = JSON.parse(fs.readFileSync("./config/endpoints.json"));

function normalizeWorkflowName(name) {

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "default";

}

function registerWorkflowName(name, workflowNames, nameMapping) {

  const normalizedName = normalizeWorkflowName(name);

  if (!nameMapping[name]) {

    let candidate = normalizedName;
    let suffix = 2;

    while (workflowNames.has(candidate)) {
      candidate = `${normalizedName}_${suffix}`;
      suffix += 1;
    }

    workflowNames.add(candidate);
    nameMapping[name] = candidate;

  }

  return nameMapping[name];

}

const declaredTags = Array.isArray(swagger.tags) ? swagger.tags.map(tag => tag.name).filter(Boolean) : [];
const workflowNames = new Set();
const nameMapping = {};
const flows = {};

declaredTags.forEach(tag => {

  const workflowName = registerWorkflowName(tag, workflowNames, nameMapping);
  flows[workflowName] = [];

});

endpoints.forEach(e => {

  const endpointTags = Array.isArray(e.tags) && e.tags.length ? e.tags : ["default"];

  endpointTags.forEach(tag => {

    const workflowName = registerWorkflowName(tag, workflowNames, nameMapping);

    if (!flows[workflowName]) {
      flows[workflowName] = [];
    }

    flows[workflowName].push(e);

  });

});

const populatedFlows = Object.fromEntries(
  Object.entries(flows).filter(([, steps]) => steps.length > 0)
);

if (Object.keys(populatedFlows).length === 0 && endpoints.length > 0) {
  populatedFlows.default = endpoints;
}

fs.writeFileSync("./config/workflows.json", JSON.stringify(populatedFlows, null, 2));

console.log("Workflows generated");