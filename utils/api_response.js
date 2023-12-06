"use strict"
module.exports.response = (code, msg, data) => {
    return { code: code, message: msg, data: data };
}