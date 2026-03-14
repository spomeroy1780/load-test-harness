import http from "k6/http";
import { getAuthHeaders } from "./auth.js";

const traffic = JSON.parse(open("../config/traffic.json"));

const baseUrl = __ENV.BASE_URL;

function pickEndpoint() {

  const total = traffic.reduce((s,e)=>s+e.weight,0);

  const r = Math.random()*total;

  let cumulative = 0;

  for(const e of traffic){

    cumulative += e.weight;

    if(r <= cumulative) return e;
  }
}

export default function(){

  const endpoint = pickEndpoint();

  const headers = getAuthHeaders();

  const url = baseUrl + endpoint.path;

  http.request(endpoint.method,url,null,{headers});

}