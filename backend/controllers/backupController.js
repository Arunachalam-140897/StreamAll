const BackupService = require('../services/backupService');
const { catchAsync } = require('../utils/errorHandler');
const { upload } = require('../utils/uploadHandler');

exports.createBackup = catchAsync(async (req, res) => {
  const backupPath = await BackupService.createBackup();
  res.download(backupPath);
});

exports.restore = [
  upload.single('backup'),
  catchAsync(async (req, res) => {
    await BackupService.restore(req.file.path);
    res.json({
      status: 'success',
      message: 'System restored successfully'
    });
  })
];