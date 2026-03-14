import fs from "fs";

const swagger = JSON.parse(fs.readFileSync("./swagger/swagger.json"));

const schemes = swagger.components?.securitySchemes || {};

const auth = [];

for (const [name, scheme] of Object.entries(schemes)) {

  if (scheme.type === "http" && scheme.scheme === "bearer") {

    auth.push({
      type: "bearer",
      envVar: "TOKEN"
    });

  }

  if (scheme.type === "apiKey") {

    auth.push({
      type: "apikey",
      header: scheme.name,
      envVar: "API_KEY"
    });

  }

}

fs.writeFileSync("./config/auth.json", JSON.stringify(auth, null, 2));

console.log("Auth config generated");