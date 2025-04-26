const mongoose = require('mongoose');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const createIndexes = require('./mongo-indexes');

async function createAdminUser() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const password = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', 10);
      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

async function initializeMongoDB() {
  try {
    await createAdminUser();
    await createIndexes();
    console.log('MongoDB initialization completed');
  } catch (error) {
    console.error('MongoDB initialization failed:', error);
    process.exit(1);
  }
}

module.exports = initializeMongoDB;