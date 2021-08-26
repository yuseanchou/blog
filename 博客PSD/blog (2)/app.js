//引入express
const express = require('express')
//导入mysql
const mysql = require('mysql')
//引入fs
const fs = require('fs')
const Core = require('@alicloud/pop-core');
const { resolve } = require('path');
//初始化express
const app = express()
//初始化静态资源文件夹
app.use('/static', express.static(__dirname + '/static'))

const dbconfig = {
    database: 'blog',
    user:'root',
    password:'root',
    charset: 'utf8mb4'
}
const read = (url) => {
    return new Promise((resolve, reject) => {
        fs.readFile(url, (err, data) => {
            if(!err) {
                resolve(data)
            } else {
                console.log(err);
                reject(err)
            }
        })
    })
}
//负责页面跳转 get--->pages/*.html
/** ------------------pages s----------------------- */
//跳转首页
app.get('/', async(req, resp) => {
    const data = await read('pages/index.html');
    resp.end(data);
}) 
//跳转到登录
app.get('/goLogin', async(req, resp) => {
    const data = await read('pages/login.html')
    resp.end(data);
}) 
app.get('/register', async(req, resp) => {
    const data = await read('pages/register.html')
    resp.end(data)
})


/** ------------------pages e----------------------- */

//负责业务逻辑： mysql + ajax + 数据响应与数据处理
/** ------------------service s----------------------- */


  
const getCode = (code) => {
    var client = new Core({
        accessKeyId: 'LTAI4GBnfBweBmdSaoUaPtaC',
        accessKeySecret: '3gHMPKqINiCrzIj3nRtrIYyxoIc0fd',
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    });
        
    var requestOption = {
        method: 'POST'
    };
    var params = {
        "code": code
    }
   return  new Promise((resolve, reject) => {
    client.request('松松学院', params, requestOption).then((result) => {
        console.log(JSON.stringify(result));
        resolve(JSON.stringify(result))
      }, (ex) => {
        console.log(ex);
        reject(ex)
      })
   })
}
  
//获取验证码
app.get('/getCode', async (req, resp) => {
    //生成一个验证码
    let code = Math.floor(Math.random()*9999);
    //调用第三方短信平台接口
    // const rsp = await getCode(code)
    // console.log('rsp:', rsp)
//返回当前验证码给前端页面
    let data = {
        code: 0,
        msg: "获取成功",
        data: code
    }
    resp.send(data)
})

//user 板块
//用户注册
app.post('/registerUser', (req, resp) => {
    let body = ''
    req.on('data', data=> {
        body += data
    })
    req.on('end', () => {
        console.log(body)
        const usp = new URLSearchParams(body)
        let user = {
            phone: usp.get('phone'),
            password: usp.get('password')
        }
        const pool = mysql.createPool(dbconfig)
        pool.getConnection((err, conn) => {
            let sql = 'insert into t_user set ?'
            conn.query(sql, user, (err, results) => {
                console.log(results);
            })
        })
    })
    resp.end()
})

//用户是否存在
app.get('/checkUser', (req, resp) => {
    const pool = mysql.createPool(dbconfig)
    pool.getConnection((err, conn) => {
        if(!err) {
            let sql = 'select * from t_user where phone = ?'
            let sqlParams = [req.query.phone]
            console.log(sqlParams);
            const query = conn.query(sql, sqlParams)
            let data = []
            query.on('result', (row, index) => {
                console.log("row:", row, "index:",index);
                data.push(row)
            })
            query.on('end', () => {
                console.log("data:", data)
                let rd = {}
                if(data.length > 0) {
                    rd.code = 10000,
                    rd.msg = '用户已存在，请直接登录',
                    rd.data= null
                } else {
                    rd.code = 0;
                    rd.msg = '请求成功'
                }
                // if(data.)
                resp.send(rd)
            })
        } else {
            console.log(err);
        }
        //释放连接池资源
        conn.release();
    })
})
/**
 * 根据手机号获取用户信息
 */
const getUserByPhone = (phone) => {
    //使用连接池创建：连接池可以创建多个conn对象，可以确保数据库的操作不会进入到阻塞状态
    const pool = mysql.createPool(dbconfig)
    pool.getConnection((err, conn) => {
        if(!err) {
            let sql = 'select * from t_level'
            const query = conn.query(sql)
            let data = []
            query.on('result', (row, index) => {
                console.log("row:", row, "index:",index);
                data.push(row)
            })
            query.on('end', () => {
                console.log("data:", data)
            })
        } else {
            console.log(err);
        }
        //释放连接池资源
        conn.release();
    })
}
app.get('/user', (req, res) => {
    getUserByPhone()
    res.end()
})

/** ------------------service e----------------------- */


//监听服务器端口
app.listen(3000, () => {
    console.log('server is start');
})