import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getCurrentUser, setAuthToken } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('civicai_token');
    if (token) {
      setAuthToken(token);
      getCurrentUser()
        .then((response) => {
          if (response?.user) {
            setUser(response.user);
          }
        })
        .catch(() => {
          setAuthToken(null);
          localStorage.removeItem('civicai_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    if (response.token) {
      localStorage.setItem('civicai_token', response.token);
      setAuthToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const register = async (name, email, password, role = 'citizen') => {
    const response = await registerUser(name, email, password, role);
    if (response.token) {
      localStorage.setItem('civicai_token', response.token);
      setAuthToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('civicai_token');
    setAuthToken(null);
    setUser(null);
    // Redirect to landing/home after logout
    try {
      navigate('/');
    } catch (err) {
      // noop if navigation not available
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
