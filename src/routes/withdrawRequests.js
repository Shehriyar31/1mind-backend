const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// File path for persistent storage
const dataFile = path.join(__dirname, '../data/withdrawRequests.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file
let withdrawRequests = [];
try {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    withdrawRequests = JSON.parse(data);
  }
} catch (error) {
  console.error('Error loading withdraw requests:', error);
  withdrawRequests = [];
}

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(withdrawRequests, null, 2));
  } catch (error) {
    console.error('Error saving withdraw requests:', error);
  }
};

// Get all withdraw requests
router.get('/', (req, res) => {
  res.json(withdrawRequests);
});

// Create new withdraw request
router.post('/', (req, res) => {
  try {
    const { platform, amount, bankName, accountNumber, accountTitle, userId, userFullName, accountUsername } = req.body;
    
    const newRequest = {
      id: Date.now().toString(),
      platform,
      amount,
      bankName,
      accountNumber,
      accountTitle,
      userId,
      userFullName,
      accountUsername,
      status: 'pending',
      createdAt: new Date()
    };
    
    withdrawRequests.push(newRequest);
    saveData();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update withdraw request status
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const requestIndex = withdrawRequests.findIndex(req => req.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (status === 'rejected') {
      // Auto-delete rejected requests
      withdrawRequests.splice(requestIndex, 1);
      saveData();
      res.json({ message: 'Request rejected and deleted' });
    } else {
      // Update status for approved requests
      withdrawRequests[requestIndex] = {
        ...withdrawRequests[requestIndex],
        status,
        updatedAt: new Date()
      };
      saveData();
      res.json(withdrawRequests[requestIndex]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete withdraw request
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    withdrawRequests = withdrawRequests.filter(req => req.id !== id);
    saveData();
    res.json({ message: 'Withdraw request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;