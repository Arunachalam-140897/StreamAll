const UserPreferencesService = require('../services/userPreferencesService');
const { catchAsync } = require('../utils/errorHandler');

exports.getPreferences = catchAsync(async (req, res) => {
  const preferences = await UserPreferencesService.getPreferences(req.user.id);
  res.json({
    status: 'success',
    data: preferences
  });
});

exports.updatePreferences = catchAsync(async (req, res) => {
  const preferences = await UserPreferencesService.updatePreferences(
    req.user.id,
    req.body
  );
  res.json({
    status: 'success',
    data: preferences
  });
});

exports.updateStreamingQuality = catchAsync(async (req, res) => {
  const { quality } = req.body;
  const preferences = await UserPreferencesService.updateStreamingQuality(
    req.user.id,
    quality
  );
  res.json({
    status: 'success',
    data: preferences
  });
});

exports.updateNotificationSettings = catchAsync(async (req, res) => {
  const preferences = await UserPreferencesService.updateNotificationSettings(
    req.user.id,
    req.body
  );
  res.json({
    status: 'success',
    data: preferences
  });
});

exports.updateUiPreferences = catchAsync(async (req, res) => {
  const preferences = await UserPreferencesService.updateUiPreferences(
    req.user.id,
    req.body
  );
  res.json({
    status: 'success',
    data: preferences
  });
});

exports.toggleOfflineMode = catchAsync(async (req, res) => {
  const preferences = await UserPreferencesService.toggleOfflineMode(req.user.id);
  res.json({
    status: 'success',
    data: preferences
  });
});

exports.setMaxDownloadSize = catchAsync(async (req, res) => {
  const { size } = req.body;
  const preferences = await UserPreferencesService.setMaxDownloadSize(
    req.user.id,
    parseInt(size)
  );
  res.json({
    status: 'success',
    data: preferences
  });
});