"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Payment.init(
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
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Amount is required",
          },
          notEmpty: {
            msg: "Amount is required",
          },
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Status is required",
          },
          notEmpty: {
            msg: "Status is required",
          },
        },
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "TransactionId already exists",
        },
        validate: {
          notNull: {
            msg: "TransactionId is required",
          },
          notEmpty: {
            msg: "TransactionId is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Payment",
    },
  );
  return Payment;
};
