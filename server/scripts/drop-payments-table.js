const { Sequelize } = require("sequelize");

const cfg = require("../config/config.json").development;
const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);

async function run() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS "Payments" CASCADE;');
    console.log("Payments table dropped (if existed). ");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
