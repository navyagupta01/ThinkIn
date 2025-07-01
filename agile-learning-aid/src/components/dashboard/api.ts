import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.116.166:8080',
});

export default api;