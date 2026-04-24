const { Sequelize } = require("sequelize");

const cfg = require("../config/config.json").development;
const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);

const TARGET = "20260421191511-create-payment.js";

async function run() {
  try {
    await sequelize.query('DELETE FROM "SequelizeMeta" WHERE name = :name', {
      replacements: { name: TARGET },
    });
    console.log("SequelizeMeta entry removed:", TARGET);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
