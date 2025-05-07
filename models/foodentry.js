"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FoodEntry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FoodEntry.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  FoodEntry.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      weight: DataTypes.INTEGER,
      calories: DataTypes.INTEGER,
      proteins: DataTypes.INTEGER,
      fats: DataTypes.INTEGER,
      carbs: DataTypes.INTEGER,
      timestamp: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "FoodEntry",
    },
  );
  return FoodEntry;
};
