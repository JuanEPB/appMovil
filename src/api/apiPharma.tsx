import axios from 'axios';

export const apiPharma = axios.create({
    baseURL: 'http://10.154.252.61:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});