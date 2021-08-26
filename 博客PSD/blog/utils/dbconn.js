//导入mysql
const mysql = require('mysql')
//数据库配置
const dbconfig = {
    database: 'blog',
    user:'root',
    password:'123456',
    charset: 'utf8'
}

exports.db = (sql, sqlParams) => {
    return new Promise((resolve, reject) => {
        const pool = mysql.createPool(dbconfig)
        pool.getConnection((err, conn) => {
            if(!err) {
                sqlParams = sqlParams || [] //确保sqlParams有值
                conn.query(sql, sqlParams, (err, results) => {
                    if(!err) {
                        console.log("result:", results)
                        resolve(results)
                    } else {
                        console.log(err)
                        reject(err)
                    }
                })
            } else {
                //打印错误日志
                console.log(err);
                reject(err)
            }
            //释放连接池资源
            conn.release();
        })
    });
    
}