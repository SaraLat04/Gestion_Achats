import axios from './axios'; // même base que auth.js

export const getUserById = async (id) => {
  const response = await axios.get(`/utilisateurs/${id}`); // assure-toi que cette route existe dans ton backend Laravel
  return response.data;
};
