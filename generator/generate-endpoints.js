import fs from "fs";

const swagger = JSON.parse(fs.readFileSync("./swagger/swagger.json"));

const endpoints = [];

for (const [path, methods] of Object.entries(swagger.paths)) {

  for (const [method, config] of Object.entries(methods)) {

    endpoints.push({
      method: method.toUpperCase(),
      path: path.replace(/{/g, "{{").replace(/}/g, "}}"),
      weight: 10,
      tags: config.tags || []
    });

  }

}

fs.writeFileSync("./config/endpoints.json", JSON.stringify(endpoints, null, 2));

console.log("Endpoints generated");