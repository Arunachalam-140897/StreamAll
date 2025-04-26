const systemMonitor = require('../utils/systemMonitor');
const Aria2Manager = require('../utils/aria2Manager');
const { catchAsync } = require('../utils/errorHandler');

exports.getMetrics = catchAsync(async (req, res) => {
  const metrics = systemMonitor.getMetricsHistory();
  res.json({
    status: 'success',
    data: metrics
  });
});

exports.getLatestMetrics = catchAsync(async (req, res) => {
  const metrics = systemMonitor.getLatestMetrics();
  res.json({
    status: 'success',
    data: metrics
  });
});

exports.getDownloadStats = catchAsync(async (req, res) => {
  const stats = await Aria2Manager.getStatus();
  res.json({
    status: 'success',
    data: stats
  });
});

exports.pauseDownloads = catchAsync(async (req, res) => {
  await Aria2Manager.pauseAll();
  res.json({
    status: 'success',
    message: 'All downloads paused successfully'
  });
});

exports.resumeDownloads = catchAsync(async (req, res) => {
  await Aria2Manager.resumeAll();
  res.json({
    status: 'success',
    message: 'All downloads resumed successfully'
  });
});

exports.purgeDownloads = catchAsync(async (req, res) => {
  await Aria2Manager.purgeAll();
  res.json({
    status: 'success',
    message: 'All downloads purged successfully'
  });
});