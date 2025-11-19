const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// File path for persistent storage
const dataFile = path.join(__dirname, '../data/accountRequests.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file
let accountRequests = [];
try {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    accountRequests = JSON.parse(data);
  }
} catch (error) {
  console.error('Error loading account requests:', error);
  accountRequests = [];
}

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(accountRequests, null, 2));
  } catch (error) {
    console.error('Error saving account requests:', error);
  }
};

// Get all account requests
router.get('/', (req, res) => {
  res.json(accountRequests);
});

// Add new account request
router.post('/', (req, res) => {
  try {
    const { platform, username, userId, userFullName } = req.body;
    const newRequest = {
      id: Date.now().toString(),
      platform,
      username,
      userId,
      userFullName,
      status: 'pending',
      createdAt: new Date()
    };
    accountRequests.push(newRequest);
    saveData();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve account request
router.patch('/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, link, status } = req.body;
    const request = accountRequests.find(req => req.id === id);
    if (request) {
      request.status = 'approved';
      request.accountDetails = {
        username,
        password,
        link,
        status: status || 'active',
        approvedAt: new Date()
      };
      saveData();
      res.json({ message: 'Request approved successfully' });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update approved account details
router.patch('/:id/update', (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, link, status } = req.body;
    const request = accountRequests.find(req => req.id === id);
    if (request && request.status === 'approved') {
      request.accountDetails = {
        ...request.accountDetails,
        username,
        password,
        link,
        status,
        updatedAt: new Date()
      };
      saveData();
      res.json({ message: 'Account updated successfully' });
    } else {
      res.status(404).json({ message: 'Approved account not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account request
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    accountRequests = accountRequests.filter(req => req.id !== id);
    saveData();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;