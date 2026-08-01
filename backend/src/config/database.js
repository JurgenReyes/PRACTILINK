const { Sequelize } = require("sequelize");
require("dotenv").config();

// En AWS, DB_HOST apunta al endpoint de la instancia de Amazon RDS (MySQL 8).
// En Azure, DB_HOST apunta al endpoint de Azure Database for MySQL, que exige SSL.
const useSSL = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);

module.exports = sequelize;