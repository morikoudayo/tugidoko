import type { User } from "./AuthContext";

export function loadUserCredentials() {
  const savedId = localStorage.getItem('id');
  const savedPass = localStorage.getItem('pass');

  const userCredentials: User = {
    id: '',
    pass: ''
  }

  if (savedId !== null && savedPass !== null) {
    userCredentials.id = savedId
    userCredentials.pass = savedPass
  }

  return userCredentials
}

export function clearUserCredentials() {
  localStorage.setItem('id', '');
  localStorage.setItem('pass', '');
}