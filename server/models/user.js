"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Payment, { foreignKey: "userId" });
      User.hasMany(models.CV, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
          notNull: {
            msg: "Name is required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email already registered",
        },
        validate: {
          notEmpty: {
            msg: "Email is required",
          },
          notNull: {
            msg: "Email is required",
          },
          isEmail: {
            args: true,
            msg: "Invalid email format",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
          notNull: {
            msg: "Password is required",
          },
          len: {
            args: [6],
            msg: "Password minimun 6 characters",
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "User",
        validate: {
          isIn: {
            args: [["Admin", "User"]],
            msg: "Invalid role",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );

  User.beforeCreate((user) => {
    user.password = hashPassword(user.password);
  });

  return User;
};
