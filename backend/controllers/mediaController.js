const MediaService = require('../services/mediaService');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { upload, handleUploadError } = require('../utils/uploadHandler');
const fs = require('fs-extra');

exports.uploadMedia = [
  upload.single('file'),
  handleUploadError,
  catchAsync(async (req, res) => {
    const media = await MediaService.create(req.body, req.file, req.user.id);
    res.status(201).json({
      status: 'success',
      data: media
    });
  })
];

exports.getAllMedia = catchAsync(async (req, res) => {
  const { page, limit, category, type, genre, search } = req.query;
  const media = await MediaService.getAll({
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    type,
    genre,
    search
  });

  res.json({
    status: 'success',
    data: media
  });
});

exports.getMedia = catchAsync(async (req, res) => {
  const media = await MediaService.getById(req.params.id);
  res.json({
    status: 'success',
    data: media
  });
});

exports.updateMedia = catchAsync(async (req, res) => {
  const media = await MediaService.update(req.params.id, req.body, req.user.id);
  res.json({
    status: 'success',
    data: media
  });
});

exports.deleteMedia = catchAsync(async (req, res) => {
  const result = await MediaService.delete(req.params.id, req.user.id);
  res.json({
    status: 'success',
    message: result.message
  });
});

exports.streamMedia = catchAsync(async (req, res) => {
  const { streamUrl, mimeType } = await MediaService.getStreamUrl(req.params.id, req.user.id);
  const range = req.headers.range;

  if (!range) {
    return res.status(400).json({
      status: 'fail',
      message: 'Range header is required for streaming'
    });
  }

  const stat = await fs.stat(streamUrl);
  const fileSize = stat.size;
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': mimeType
  });

  const stream = fs.createReadStream(streamUrl, { start, end });
  stream.pipe(res);
});