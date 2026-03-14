const auth = JSON.parse(open("../config/auth.json"));

export function getAuthHeaders() {

  let headers = {};

  auth.forEach(a => {

    if (a.type === "bearer") {
      headers["Authorization"] = `Bearer ${__ENV.TOKEN}`;
    }

    if (a.type === "apikey") {
      headers[a.header] = __ENV.API_KEY;
    }

  });

  return headers;

}