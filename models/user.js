"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      email: {
        DataTypes: STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        DataTypes: STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
