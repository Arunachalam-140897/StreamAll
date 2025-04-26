'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_preferences', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      streamingQuality: {
        type: Sequelize.STRING,
        defaultValue: '720p'
      },
      preferredAudioFormat: {
        type: Sequelize.STRING,
        defaultValue: 'mp3'
      },
      enableOfflineMode: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      maxDownloadSize: {
        type: Sequelize.INTEGER,
        defaultValue: 2147483648 // 2GB
      },
      notificationSettings: {
        type: Sequelize.JSONB,
        defaultValue: {
          downloadComplete: true,
          newContent: true,
          requestUpdates: true,
          enablePush: false
        }
      },
      uiPreferences: {
        type: Sequelize.JSONB,
        defaultValue: {
          theme: 'system',
          listView: 'grid',
          sortOrder: 'dateAdded',
          showThumbnails: true,
          autoplay: true
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_preferences');
  }
};