class ExpressError extends Error {
    constructor(statusCode, messege) {
        super();
        this.statusCode = statusCode
        this.messege = messege
    }
}
module.exports = ExpressError;