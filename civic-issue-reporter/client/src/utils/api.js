// utils/api.js - Centralized API calls
import axios from 'axios';

// Base URL - uses Vite proxy in dev, direct URL in production
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ============================================================
// AUTH API
// ============================================================

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function loginUser(email, password) {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

export async function registerUser(name, email, password, role = 'citizen') {
  try {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

export async function login(email, password, name = null, role = null) {
  try {
    if (name && role) {
      // Register
      return await registerUser(name, email, password, role);
    } else {
      // Login
      return await loginUser(email, password);
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

// ============================================================
// COMPLAINTS API
// ============================================================

/**
 * Submit a new complaint (supports image upload)
 */
export async function submitComplaint(formData) {
  const response = await api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Get all complaints with optional filters
 */
export async function getComplaints(filters = {}) {
  const response = await api.get('/complaints', { params: filters });
  return response.data;
}

/**
 * Get a single complaint by ID
 */
export async function getComplaint(id) {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
}

/**
 * Update complaint status
 */
export async function updateComplaintStatus(id, status) {
  const response = await api.patch(`/complaints/${id}/status`, { status });
  return response.data;
}

/**
 * Get analytics data
 */
export async function getAnalytics() {
  const response = await api.get('/complaints/analytics');
  return response.data;
}

// ============================================================
// LEGAL ADVICE API
// ============================================================

/**
 * Get AI-powered legal advice for a query
 */
export async function getLegalAdvice(query) {
  const response = await api.post('/legal-advice', { query });
  return response.data;
}

// Dashboard stats
export async function getDashboardStats() {
  try {
    const response = await api.get('/dashboard-stats');
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

// Vote on a complaint
export async function voteComplaint(id, type) {
  try {
    const response = await api.post(`/vote/${id}`, { type });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

// AI Action Engine analysis
export async function analyzeComplaintAction(complaintText) {
  try {
    const response = await api.post('/ai-action', { complaint_text: complaintText });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

// ============================================================
// WHATSAPP INTEGRATION
// ============================================================

export async function initiateWhatsAppFlow() {
  const response = await api.post('/whatsapp/init');
  return response.data;
}

export default api;
