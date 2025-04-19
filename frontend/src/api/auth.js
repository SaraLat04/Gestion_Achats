import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Remplacez par l'URL de votre backend Laravel

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const register = async (nom, prenom, email, password, role) => {
  const response = await axios.post(`${API_URL}/register`, {
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
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}/logout`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export default { login, register, logout };
