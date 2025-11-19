const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const complaintsFile = path.join(__dirname, '../data/complaints.json');

// Initialize complaints file if it doesn't exist
const initComplaintsFile = async () => {
  try {
    await fs.access(complaintsFile);
  } catch (error) {
    await fs.writeFile(complaintsFile, JSON.stringify([]));
  }
};

// Get all complaints
router.get('/', async (req, res) => {
  try {
    await initComplaintsFile();
    const data = await fs.readFile(complaintsFile, 'utf8');
    const complaints = JSON.parse(data);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load complaints' });
  }
});

// Create new complaint
router.post('/', async (req, res) => {
  try {
    await initComplaintsFile();
    const { accountUsername, message, userId, userFullName } = req.body;
    
    const data = await fs.readFile(complaintsFile, 'utf8');
    const complaints = JSON.parse(data);
    
    const newComplaint = {
      id: Date.now().toString(),
      accountUsername,
      message,
      userId,
      userFullName,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    complaints.push(newComplaint);
    await fs.writeFile(complaintsFile, JSON.stringify(complaints, null, 2));
    
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create complaint' });
  }
});

// Update complaint status
router.patch('/:id/status', async (req, res) => {
  try {
    await initComplaintsFile();
    const { id } = req.params;
    const { status } = req.body;
    
    const data = await fs.readFile(complaintsFile, 'utf8');
    const complaints = JSON.parse(data);
    
    const complaintIndex = complaints.findIndex(c => c.id === id);
    if (complaintIndex === -1) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaints[complaintIndex].status = status;
    complaints[complaintIndex].updatedAt = new Date().toISOString();
    
    await fs.writeFile(complaintsFile, JSON.stringify(complaints, null, 2));
    
    res.json(complaints[complaintIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update complaint status' });
  }
});

// Delete complaint
router.delete('/:id', async (req, res) => {
  try {
    await initComplaintsFile();
    const { id } = req.params;
    
    const data = await fs.readFile(complaintsFile, 'utf8');
    const complaints = JSON.parse(data);
    
    const complaintIndex = complaints.findIndex(c => c.id === id);
    if (complaintIndex === -1) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    complaints.splice(complaintIndex, 1);
    await fs.writeFile(complaintsFile, JSON.stringify(complaints, null, 2));
    
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete complaint' });
  }
});

module.exports = router;