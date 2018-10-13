import axios from "axios";

const BASE_URL = "http://localhost";

export const getPredictions = form => {
  return axios.post(`${BASE_URL}`, form);
}
