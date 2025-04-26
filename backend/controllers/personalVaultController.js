const PersonalVaultService = require('../services/personalVaultService');
const { catchAsync } = require('../utils/errorHandler');
const { upload } = require('../utils/uploadHandler');

exports.addVaultItem = [
  upload.single('file'),
  catchAsync(async (req, res) => {
    const { type, isEncrypted } = req.body;
    const item = await PersonalVaultService.addItem(
      req.user.id,
      req.file,
      type,
      isEncrypted === 'true'
    );

    res.status(201).json({
      status: 'success',
      data: item
    });
  })
];

exports.getVaultItem = catchAsync(async (req, res) => {
  const item = await PersonalVaultService.getItem(req.params.id, req.user.id);

  // If item is encrypted and has a temporary decrypted path, use that
  const filePath = item.tempPath || item.filePath;

  // Stream the file
  res.sendFile(filePath, {
    headers: {
      'Content-Type': item.type === 'photo' ? 'image/*' : 'video/*'
    }
  });
});

exports.getAllVaultItems = catchAsync(async (req, res) => {
  const { page, limit, type } = req.query;
  const items = await PersonalVaultService.getAllItems(req.user.id, {
    page: parseInt(page),
    limit: parseInt(limit),
    type
  });

  res.json({
    status: 'success',
    data: items
  });
});

exports.deleteVaultItem = catchAsync(async (req, res) => {
  const result = await PersonalVaultService.deleteItem(req.params.id, req.user.id);
  res.json({
    status: 'success',
    message: result.message
  });
});