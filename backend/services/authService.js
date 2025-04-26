const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken } = require('../utils/token');
const { AppError } = require('../utils/errorHandler');

exports.login = async ({ username, password }) => {
  if (!username || !password) {
    throw new AppError('Please provide username and password', 400);
  }

  const user = await User.findOne({ username });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }

  return generateToken({ id: user._id, role: user.role });
};

exports.register = async ({ username, password }) => {
  if (!username || !password) {
    throw new AppError('Please provide username and password', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hash });

  return generateToken({ id: user._id, role: user.role });
};
