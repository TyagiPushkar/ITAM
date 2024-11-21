// utils/auth.js

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Assuming user info is stored here
  return user && user.role === 'Admin'; // Adjust the key and role check as necessary
};
