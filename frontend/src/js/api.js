import axios from "axios";

const BASE_URL = "https://www.ntumods.com";

export const getPredictions = tweet => {
  return axios.post(`${BASE_URL}`, {
    text: [tweet]
  });
};
