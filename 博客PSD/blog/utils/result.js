module.exports = {
    success: (msg, data) => {
        return {code: 0, msg, data}
    },
    error: (code, msg) => {
        console.log(code, msg)
        if(typeof code === 'string') {
            msg = code
            code = 10001
        }
        return {code, msg}
    }
}