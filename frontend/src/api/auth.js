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

const register = async (nom, prenom, email, password, role) => {
  const response = await axios.post('/register', {
    nom,
    prenom,
    email,
    password,
    role,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const logout = async () => {
  await axios.post('/logout');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export default { login, register, logout };
