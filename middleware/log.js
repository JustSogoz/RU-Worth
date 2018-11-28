const moment = require("moment");

function log(request, response, next) {
    
    const now = moment();
    const nowFormatted = now.format('MMMM Do YYYY, h:mm:ss a');
    console.log(`${nowFormatted} ${request.method} ${request.originalUrl} ${request.ip}`);
    next();
}

module.exports = log; 