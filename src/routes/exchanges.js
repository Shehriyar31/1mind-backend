const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// File path for persistent storage
const dataFile = path.join(__dirname, '../data/exchanges.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file
let exchanges = [];
try {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    exchanges = JSON.parse(data);
  }
} catch (error) {
  console.error('Error loading exchanges:', error);
  exchanges = [];
}

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(exchanges, null, 2));
  } catch (error) {
    console.error('Error saving exchanges:', error);
  }
};

// Get all exchanges
router.get('/', (req, res) => {
  res.json(exchanges);
});

// Add new exchange
router.post('/', (req, res) => {
  try {
    const { name, minDeposit } = req.body;
    
    // Check if exchange already exists
    const existingExchange = exchanges.find(ex => ex.name.toLowerCase() === name.toLowerCase());
    if (existingExchange) {
      return res.status(400).json({ message: 'Exchange already exists' });
    }
    
    const newExchange = {
      id: Date.now().toString(),
      name,
      minDeposit: minDeposit || '500',
      createdAt: new Date()
    };
    exchanges.push(newExchange);
    saveData();
    res.status(201).json(newExchange);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exchange
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, minDeposit } = req.body;
    
    const exchangeIndex = exchanges.findIndex(ex => ex.id === id);
    if (exchangeIndex === -1) {
      return res.status(404).json({ message: 'Exchange not found' });
    }
    
    // Check if new name conflicts with existing exchange (excluding current one)
    const existingExchange = exchanges.find(ex => ex.name.toLowerCase() === name.toLowerCase() && ex.id !== id);
    if (existingExchange) {
      return res.status(400).json({ message: 'Exchange name already exists' });
    }
    
    exchanges[exchangeIndex] = {
      ...exchanges[exchangeIndex],
      name,
      minDeposit: minDeposit || '500',
      updatedAt: new Date()
    };
    
    saveData();
    res.json(exchanges[exchangeIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete exchange
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    exchanges = exchanges.filter(ex => ex.id !== id);
    saveData();
    res.json({ message: 'Exchange deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;