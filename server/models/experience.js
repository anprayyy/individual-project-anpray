'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Experience extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Experience.belongsTo(models.CV, { foreignKey: "cvId" });
    }
  }
  Experience.init({
    cvId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "CvId is required",
        },
        notEmpty: {
          msg: "CvId is required"
        }
      }
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Company is required",
        },
        notEmpty: {
          msg: "Company is required"
        }
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Position is required",
        },
        notEmpty: {
          msg: "Position is required"
        }
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "StartDate is required",
        },
        notEmpty: {
          msg: "StartDate is required"
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "EndDate is required",
        },
        notEmpty: {
          msg: "EndDate is required"
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Description is required",
        },
        notEmpty: {
          msg: "Description is required"
        }
      }
    },
  }, 
  {
    sequelize,
    modelName: 'Experience',
  });
  return Experience;
};