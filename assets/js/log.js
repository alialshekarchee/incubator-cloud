var fs = require('fs');

function createDeviceLogDir(uuid) {
    fs.mkdir(`log/data/${uuid}`, err => {if (err) console.log(err)});
}

function removeDeviceLogDir(uuid) {
    fs.rmdir(`log/data/${uuid}`, err => {if (err) console.log(err)});
}

function writeLog(type, recored, catagory) {
    recored.type = type;
    const d = new Date();
    var datetime = d.getDate() + "/"
        + (d.getMonth() + 1) + "/"
        + d.getFullYear() + " @ "
        + d.getHours() + ":"
        + d.getMinutes() + ":"
        + d.getSeconds();
    recored.date = datetime;
    var dateStamp = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    fs.appendFile(`log/${catagory}/${dateStamp}.txt`, JSON.stringify(recored) + ',', err => {
        if (err) throw err;
    });
}

function writeDataLog(type, recored, uuid) {
    recored.type = type;
    const d = new Date();
    var datetime = d.getDate() + "/"
        + (d.getMonth() + 1) + "/"
        + d.getFullYear() + " @ "
        + d.getHours() + ":"
        + d.getMinutes() + ":"
        + d.getSeconds();
    recored.date = datetime;
    var dateStamp = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    fs.appendFile(`log/data/${uuid}/${dateStamp}.txt`, JSON.stringify(recored) + ',', err => {
        if (err) throw err;
    });
}

function readLog(name, callback, catagory) {
    fs.readFile(`log/${catagory}/${name}.txt`, "utf8", (err, data) => {
        if (err) {
            callback(`{"err": "${err}", "error": "No records found for the specified date."}`);
        } else {
            data = data.substring(0, data.length - 1);
            data = '[' + data + ']';
            callback(data);
        }
    });
}

function readDataLog(name, callback, uuid) {
    fs.readFile(`log/data/${uuid}/${name}.txt`, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            callback(`{"err": "${err}", "error": "No records found for the specified date."}`);
        } else {
            data = data.substring(0, data.length - 1);
            data = '[' + data + ']';
            callback(data);
        }
    });
}

function system(type, recored) {
    writeLog(type, recored, 'system');
}

function user(type, recored) {
    writeLog(type, recored, 'users');
}

function device(type, recored) {
    writeLog(type, recored, 'devices');
}

function data(type, recored, uuid) {
    writeDataLog(type, recored, uuid);
}

function getSystemLog(name, callback) {
    readLog(name, callback, 'system');
}

function getUsersLog(name, callback) {
    readLog(name, callback, 'users');
}

function getDevicesLog(name, callback) {
    readLog(name, callback, 'devices');
}

function getDataLog(name, callback, uuid) {
    readDataLog(name, callback, uuid);
}
module.exports = { createDeviceLogDir, removeDeviceLogDir, system, user, device, data, getSystemLog, getUsersLog, getDevicesLog, getDataLog };