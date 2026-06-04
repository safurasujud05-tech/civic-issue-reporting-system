// db/mockDb.js - In-memory database for development without PostgreSQL
const { v4: uuidv4 } = require('uuid');

// Seed data - pre-loaded complaints for demo
let complaints = [
  {
    id: uuidv4(),
    title: 'Street Light Not Working',
    description: 'The street light near Park Road junction has been off for 5 days causing safety concerns at night.',
    category: 'Electricity',
    department: 'Electricity Board (BESCOM)',
    status: 'In Progress',
    latitude: 12.9716,
    longitude: 77.5946,
    location_name: 'Park Road Junction, Bengaluru',
    image_url: null,
    votes: 0,
    votesByUser: {},
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Pothole on Main Street',
    description: 'Large pothole on MG Road near the bus stop is causing accidents. Multiple vehicles have been damaged.',
    category: 'Roads',
    department: 'BBMP (Roads Division)',
    status: 'Submitted',
    latitude: 12.9758,
    longitude: 77.6012,
    location_name: 'MG Road, Bengaluru',
    image_url: null,
    votes: 0,
    votesByUser: {},
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Garbage Not Collected for a Week',
    description: 'Garbage collection has not happened in our locality for 7 days. The smell is unbearable and attracting stray animals.',
    category: 'Garbage',
    department: 'BBMP Solid Waste Management',
    status: 'Resolved',
    latitude: 12.9352,
    longitude: 77.6245,
    location_name: 'HSR Layout, Bengaluru',
    image_url: null,
    votes: 0,
    votesByUser: {},
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'No Water Supply for 3 Days',
    description: 'Our entire apartment complex has had no water supply for 3 days. We have filed a complaint with BWSSB but no action taken.',
    category: 'Water',
    department: 'BWSSB (Water Supply)',
    status: 'In Progress',
    latitude: 12.9279,
    longitude: 77.6271,
    location_name: 'Koramangala, Bengaluru',
    image_url: null,
    votes: 0,
    votesByUser: {},
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const users = [];

// Simulate database operations
const mockDb = {
  // Get all complaints
  getAllComplaints: () => {
    return [...complaints].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Get complaint by ID
  getComplaintById: (id) => {
    return complaints.find(c => c.id === id) || null;
  },

  // Create a new complaint
  createComplaint: (data) => {
    const newComplaint = {
      id: uuidv4(),
      ...data,
      status: 'Submitted',
      votes: 0,
      votesByUser: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    complaints.unshift(newComplaint);
    return newComplaint;
  },

  // Voting: add or change a vote for a complaint by voterId
  addVote: (complaintId, voterId, type) => {
    const idx = complaints.findIndex(c => c.id === complaintId);
    if (idx === -1) return null;

    const complaint = complaints[idx];
    const voteValue = type === 'downvote' ? -1 : 1;
    const prev = complaint.votesByUser[voterId] || 0;

    if (prev === voteValue) {
      // no change
      return { complaint, changed: false };
    }

    // adjust total votes: remove previous and add new
    complaint.votes = (complaint.votes || 0) - prev + voteValue;
    complaint.votesByUser[voterId] = voteValue;
    complaint.updated_at = new Date().toISOString();

    // keep array order unchanged
    return { complaint, changed: true };
  },

  // Update complaint status
  updateStatus: (id, status) => {
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index].status = status;
      complaints[index].updated_at = new Date().toISOString();
      return complaints[index];
    }
    return null;
  },

  // User functions
  getUserById: (id) => users.find(u => u.id === id) || null,
  findUserByEmail: (email) => users.find(u => u.email === email.toLowerCase()) || null,
  createUser: ({ name, email, password, role = 'citizen' }) => {
    const newUser = { id: uuidv4(), name, email: email.toLowerCase(), password, role };
    users.push(newUser);
    return newUser;
  },
};

module.exports = mockDb;
