import axios from "axios";

const api = axios.create({
    baseURL: "https://shopkart-app-cuob.onrender.com",
    withCredentials: true
});

export default api;