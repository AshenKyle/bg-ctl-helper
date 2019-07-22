const online = false; // true = online, false = debugging/running locally


let localConfig;
try { localConfig = require("./localconfig"); } catch (e) { }
const DB_VARS = {
    USER: online ? process.env.DB_USER : localConfig.DB_USER,
    PW: online ? process.env.DB_PW : localConfig.DB_PW,
    PORT: online ? process.env.DB_PORT : localConfig.DB_PORT,
    NAME: 'bg-ctl-helper'
};

const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongo://' + DB_VARS.USER + ':' + DB_VARS.PW + '@ds1' + DB_VARS.PORT + '.mlab.com:' + DB_VARS.PORT + '/bg-ctl-helper';

module.exports = {
    asd: "asd"
};