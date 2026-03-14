import fs from "fs";
import { generate } from "json-schema-faker";

const swagger = JSON.parse(fs.readFileSync("./swagger/swagger.json", "utf8"));

const payloads = {};

for (const [path, methods] of Object.entries(swagger.paths)) {

  for (const [method, config] of Object.entries(methods)) {

    if (!config.requestBody) continue;

    const schema =
      config.requestBody?.content?.["application/json"]?.schema;

    if (!schema) continue;

    const key = `${method.toUpperCase()} ${path}`;

    try {

      const example = await generate(schema);

      payloads[key] = example;

    } catch (e) {

      console.log("Skipping schema:", path);

    }

  }

}

fs.writeFileSync(
  "./config/payloads.json",
  JSON.stringify(payloads, null, 2)
);

console.log("Payload templates generated");