const mongoose = require('mongoose');

// Import all models
const User = require('./user');
const Media = require('./media');
const Downloads = require('./downloads');
const Notifications = require('./notifications');
const PersonalVault = require('./personalVault');
const Requests = require('./requests');
const RSSFeeds = require('./rssFeeds');
const UserPreferences = require('./userPreferences');

module.exports = {
  User,
  Media,
  Downloads,
  Notifications,
  PersonalVault,
  Requests,
  RSSFeeds,
  UserPreferences,
  mongoose
};
