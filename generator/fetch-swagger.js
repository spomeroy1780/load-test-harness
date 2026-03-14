import axios from "axios";
import fs from "fs";

const url = process.env.SWAGGER_URL;

const res = await axios.get(url);

fs.writeFileSync("./swagger/swagger.json", JSON.stringify(res.data, null, 2));

console.log("Swagger downloaded");