const payloads = JSON.parse(open("../config/payloads.json"));

export function getPayload(method, path) {

  const key = `${method} ${path.replace("{{id}}","{id}")}`;

  if (!payloads[key]) return null;

  const payload = JSON.parse(JSON.stringify(payloads[key]));

  // randomize numbers slightly
  Object.keys(payload).forEach(k => {

    if (typeof payload[k] === "number") {

      payload[k] = payload[k] + Math.floor(Math.random() * 1000);

    }

  });

  return JSON.stringify(payload);

}