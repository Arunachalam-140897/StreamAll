const { login, register } = require('../services/authService');

const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.login = catchAsync(async (req, res) => {
  const token = await login(req.body);
  res.json({
    status: 'success',
    token
  });
});

exports.register = catchAsync(async (req, res) => {
  const token = await register(req.body);
  res.status(201).json({
    status: 'success',
    token
  });
});
