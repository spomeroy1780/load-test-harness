const fs = require("fs");

const swagger = JSON.parse(fs.readFileSync("swagger.json"));

const endpoints = [];

for (const [path, methods] of Object.entries(swagger.paths)) {

  for (const [method, config] of Object.entries(methods)) {

    const tags = config.tags || [];
    let weight = 10;

    if (tags.includes("checkout")) weight = 30;
    if (tags.includes("catalog")) weight = 50;

    let bodyTemplate = null;

    if (config.requestBody) {

      const content =
        config.requestBody.content?.["application/json"];

      if (content?.example) {
        bodyTemplate = content.example;
      }

      if (content?.schema?.example) {
        bodyTemplate = content.schema.example;
      }
    }

    endpoints.push({
      name: `${method}_${path.replace(/[\/{}]/g, "_")}`,
      method: method.toUpperCase(),
      path: path.replace(/{/g, "{{").replace(/}/g, "}}"),
      weight: weight,
      bodyTemplate: bodyTemplate
    });
  }
}

fs.writeFileSync(
  "config/endpoints.json",
  JSON.stringify(endpoints, null, 2)
);

console.log("Generated endpoints.json");