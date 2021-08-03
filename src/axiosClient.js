import axios from "axios";

const defaultOptions = {
  baseURL: "https://api.twitter.com/1.1/",
  headers: {
    authority: "api.twitter.com",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
};

const axiosClient = axios.create(defaultOptions);

export default axiosClient;
