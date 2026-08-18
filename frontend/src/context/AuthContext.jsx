import { createContext, useContext, useState } from 'react';

// NOTE: these endpoint paths are a reasonable guess at REST conventions
// (POST /api/auth/login, POST /api/auth/register) matching the JWT-auth
// backend already running at API_BASE. Adjust the paths below if your
// FastAPI routes are named differently.
const API_BASE = 'https://careerforge-api-i1v3.onrender.com';

// TEMPORARY: while there's no real auth/security wired up yet, MOCK_AUTH
// lets login succeed with ANY email + password so the student dashboard
// can be reviewed end-to-end. Flip this to false once the real backend
// auth endpoints are ready — the real fetch calls are already written
// below and will take over automatically.
const MOCK_AUTH = true;

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('cf_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function nameFromEmail(email) {
  const local = email.split('@')[0] || 'there';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('cf_token'));

  function persist(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem('cf_user', JSON.stringify(nextUser));
      localStorage.setItem('cf_token', nextToken);
    } else {
      localStorage.removeItem('cf_user');
      localStorage.removeItem('cf_token');
    }
  }

  async function login(email, password) {
    if (MOCK_AUTH) {
      // Any email/password combination succeeds while auth isn't real yet.
      const mockUser = { name: nameFromEmail(email), email, role: 'student' };
      const mockToken = 'mock-token';
      persist(mockUser, mockToken);
      return mockUser;
    }

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error('Incorrect email or password.');
    }
    const data = await res.json();
    persist(data.user, data.token);
    return data.user;
  }

  async function register(payload) {
    if (MOCK_AUTH) {
      const mockUser = { name: payload.name || nameFromEmail(payload.email), email: payload.email, role: 'student' };
      const mockToken = 'mock-token';
      persist(mockUser, mockToken);
      return mockUser;
    }

    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Could not create your account. That email may already be registered.');
    }
    const data = await res.json();
    persist(data.user, data.token);
    return data.user;
  }

  function logout() {
    persist(null, null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, apiBase: API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
