'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('media', 'streamPath', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('media', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {},
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('media', 'streamPath');
    await queryInterface.removeColumn('media', 'metadata');
  }
};