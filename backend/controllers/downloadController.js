const DownloadService = require('../services/downloadService');
const { catchAsync } = require('../utils/errorHandler');

exports.startDownload = catchAsync(async (req, res) => {
  const { mediaId, sourceType, sourceUrl } = req.body;
  const download = await DownloadService.addDownload(
    mediaId,
    { sourceType, sourceUrl },
    req.user.id
  );

  res.status(201).json({
    status: 'success',
    data: download
  });
});

exports.getDownloadStatus = catchAsync(async (req, res) => {
  const download = await DownloadService.getStatus(req.params.id);
  res.json({
    status: 'success',
    data: download
  });
});

exports.cancelDownload = catchAsync(async (req, res) => {
  const result = await DownloadService.cancelDownload(req.params.id, req.user.id);
  res.json({
    status: 'success',
    message: result.message
  });
});