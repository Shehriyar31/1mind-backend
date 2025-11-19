const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// File path for persistent storage
const dataFile = path.join(__dirname, '../data/depositRequests.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file
let depositRequests = [];
try {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    depositRequests = JSON.parse(data);
  }
} catch (error) {
  console.error('Error loading deposit requests:', error);
  depositRequests = [];
}

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(depositRequests, null, 2));
  } catch (error) {
    console.error('Error saving deposit requests:', error);
  }
};

// Get all deposit requests
router.get('/', (req, res) => {
  res.json(depositRequests);
});

// Create new deposit request
router.post('/', (req, res) => {
  try {
    const { platform, amount, method, transactionId, userId, userFullName, accountUsername, screenshotData } = req.body;
    
    console.log('Received screenshot data length:', screenshotData?.length);
    
    const newRequest = {
      id: Date.now().toString(),
      platform,
      amount,
      method,
      transactionId,
      userId,
      userFullName,
      accountUsername,
      status: 'pending',
      createdAt: new Date(),
      screenshot: req.body.screenshot || null,
      screenshotData: screenshotData || null
    };
    
    depositRequests.push(newRequest);
    saveData();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update deposit request status
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const requestIndex = depositRequests.findIndex(req => req.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (status === 'rejected') {
      // Auto-delete rejected requests
      depositRequests.splice(requestIndex, 1);
      saveData();
      res.json({ message: 'Request rejected and deleted' });
    } else {
      // Update status for approved requests
      depositRequests[requestIndex] = {
        ...depositRequests[requestIndex],
        status,
        updatedAt: new Date()
      };
      saveData();
      res.json(depositRequests[requestIndex]);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete deposit request
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    depositRequests = depositRequests.filter(req => req.id !== id);
    saveData();
    res.json({ message: 'Deposit request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;