const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { regNumber, fullName, username, whatsapp, password, role } = req.body;
    
    const existingUser = await User.findOne({ 
      $or: [{ username }, { whatsapp }] 
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.whatsapp === whatsapp) {
        return res.status(400).json({ message: 'WhatsApp number already registered' });
      }
    }

    const user = new User({ 
      regNumber, 
      fullName, 
      username, 
      whatsapp, 
      password, 
      role: role || 'bettor' 
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        regNumber: user.regNumber,
        fullName, 
        username, 
        whatsapp,
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username OR WhatsApp number
    const user = await User.findOne({ 
      $or: [
        { username: username },
        { whatsapp: username }
      ]
    });
    
    if (!user || !await user.comparePassword(password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, regNumber: user.regNumber, fullName: user.fullName, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user password and status
router.patch('/users/:id', async (req, res) => {
  try {
    const { password, isActive } = req.body;
    console.log('Update request:', { password: !!password, isActive });
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (password && password.trim()) {
      user.password = password;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    
    console.log('Before save:', { isActive: user.isActive });
    await user.save();
    console.log('After save:', { isActive: user.isActive });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check user status
router.get('/user-status/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('isActive');
    if (!user) {
      return res.status(404).json({ exists: false });
    }
    res.json({ exists: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;