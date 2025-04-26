const RSSParser = require('rss-parser');
const { RSSFeeds } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { catchAsync } = require('../utils/errorHandler');

const parser = new RSSParser();

exports.getAllFeeds = catchAsync(async (req, res) => {
  const feeds = await RSSFeeds.findAll();
  res.json({
    status: 'success',
    data: feeds
  });
});

exports.addFeed = catchAsync(async (req, res) => {
  const { url, label } = req.body;

  // Validate feed URL by attempting to parse it
  try {
    await parser.parseURL(url);
  } catch (error) {
    throw new AppError('Invalid RSS feed URL', 400);
  }

  const feed = await RSSFeeds.create({ url, label });
  res.status(201).json({
    status: 'success',
    data: feed
  });
});

exports.getFeedItems = catchAsync(async (req, res) => {
  const feed = await RSSFeeds.findByPk(req.params.id);
  if (!feed) {
    throw new AppError('Feed not found', 404);
  }

  const feedContent = await parser.parseURL(feed.url);
  res.json({
    status: 'success',
    data: feedContent.items
  });
});

exports.deleteFeed = catchAsync(async (req, res) => {
  const feed = await RSSFeeds.findByPk(req.params.id);
  if (!feed) {
    throw new AppError('Feed not found', 404);
  }

  await feed.destroy();
  res.json({
    status: 'success',
    message: 'Feed deleted successfully'
  });
});