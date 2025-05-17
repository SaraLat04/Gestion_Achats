// src/api/auth.js
import axios from './axios';

const login = async (email, password) => {
  const response = await axios.post('/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const register = async (formData) => {
  return axios.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};



const logout = async () => {
  await axios.post('/logout');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export default { login, register, logout };
