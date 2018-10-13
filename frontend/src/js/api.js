import axios from "axios";

const BASE_URL = "https://ec2-54-251-166-188.ap-southeast-1.compute.amazonaws.com";

export const getPredictions = tweet => {
  return axios.post(`${BASE_URL}`, {
    text: [tweet]
  });
}
