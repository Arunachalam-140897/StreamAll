const ConfigService = require('../services/configService');
const { catchAsync } = require('../utils/errorHandler');

exports.getConfig = catchAsync(async (req, res) => {
  const { key } = req.query;
  const config = await ConfigService.get(key);
  res.json({
    status: 'success',
    data: config
  });
});

exports.updateConfig = catchAsync(async (req, res) => {
  const { key, value } = req.body;
  const config = await ConfigService.update(key, value);
  res.json({
    status: 'success',
    data: config
  });
});