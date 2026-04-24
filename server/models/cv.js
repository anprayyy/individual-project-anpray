"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CV extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CV.belongsTo(models.User, { foreignKey: "userId" });
      CV.hasMany(models.Experience, { foreignKey: "cvId" });
    }
  }
  CV.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "UserId is required",
          },
          notEmpty: {
            msg: "UserId is required",
          },
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title is required",
          },
          notEmpty: {
            msg: "Title is required",
          },
        },
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Validate is required",
          },
          notEmpty: {
            msg: "Validate is required",
          },
        },
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Education is required",
          },
          notEmpty: {
            msg: "Education is required",
          },
        },
      },
      skills: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Skills is required",
          },
          notEmpty: {
            msg: "Skills is required",
          },
        },
      },
      file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Photo must be valid",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "CV",
    },
  );
  return CV;
};
