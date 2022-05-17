// database module
const mysql = require('mysql');
const {Sequelize} = require('sequelize');

const config = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'aStore',
    dialect:'mysql',
    timezone: '+03:30',
};

const sequelize = new Sequelize(config.database,config.user,config.password,{
    host:config.host,
    dialect: config.dialect,
    timezone:config.timezone,
});

sequelize.sync()

// init database
const pool = mysql.createPool(config);

//Fetch data
function RunQuery(sql, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            ShowErrors(err);
        }
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                ShowErrors(err);
            }
            conn.release();
            callback(rows);
        });
    });
}

//Throw errors
function ShowErrors(err) {
    throw err;
}

module.exports = {
    RunQuery: RunQuery,
    config:config,
    sequelize:sequelize
};