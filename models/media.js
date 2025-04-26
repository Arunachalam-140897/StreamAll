const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('movie', 'series', 'animation'),
      allowNull: false
    },
    genre: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    type: {
      type: DataTypes.ENUM('video', 'audio'),
      allowNull: false
    },
    format: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING
    },
    streamPath: {
      type: DataTypes.STRING,
      comment: 'Path to HLS stream master playlist'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Media metadata like duration, bitrate, resolution, etc.'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'media'
  });

  Media.associate = (models) => {
    Media.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return Media;
};