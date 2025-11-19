const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// File path for persistent storage
const dataFile = path.join(__dirname, '../data/bankAccounts.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file
let bankAccounts = [];
try {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    bankAccounts = JSON.parse(data);
  }
} catch (error) {
  console.error('Error loading bank accounts:', error);
  bankAccounts = [];
}

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(bankAccounts, null, 2));
  } catch (error) {
    console.error('Error saving bank accounts:', error);
  }
};

// Get all bank accounts
router.get('/', (req, res) => {
  res.json(bankAccounts);
});

// Add new bank account
router.post('/', (req, res) => {
  try {
    const { bankName, accountNumber, accountTitle } = req.body;
    const newAccount = {
      id: Date.now().toString(),
      bankName,
      accountNumber,
      accountTitle,
      createdAt: new Date()
    };
    bankAccounts.push(newAccount);
    saveData();
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bank account
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountTitle } = req.body;
    const account = bankAccounts.find(acc => acc.id === id);
    if (account) {
      account.bankName = bankName;
      account.accountNumber = accountNumber;
      account.accountTitle = accountTitle;
      account.updatedAt = new Date();
      saveData();
      res.json({ message: 'Bank account updated successfully' });
    } else {
      res.status(404).json({ message: 'Bank account not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete bank account
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    bankAccounts = bankAccounts.filter(acc => acc.id !== id);
    saveData();
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;