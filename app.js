const express = require('express')
const util = require('./util')
const user = require('./manage/user')
const blog = require('./manage/blog')
const crypto = require('crypto')
const app = express()
const path = require('path')
const cookieSession = require('cookie-session')

//设置静态资源路径
app.use('/static', express.static(__dirname + '/static'));
//引入ejs
app.engine('.html', require('ejs').__express);
//设置具体的路由
app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'html');
app.use(cookieSession({
    name:'session',
    secret: 'user',
    maxAge: 24 * 60 * 60 * 1000
}))

/**
 * 1:负责页面跳转
 * 2：负责业务数据处理
 */

//发送get请求
app.get('/', (req, resp) => {
    // util.read('pages/index.html')
    //     .then(res => {
    //         resp.write(res)
    //         resp.end()
    //     })
    resp.render('index', {
        title: '汉文化博客系统首页'
    })
})
//跳转到登录页面
app.get('/toLogin', (req, resp) => {
    // const data = await util.read('pages/login.html')
    // resp.end(data);
    resp.render('login', {
        title: "汉文化博客系统登录"
    })
})
//跳转到注册页面
app.get('/toRegister', (req, resp) => {
    resp.render('register', {
        title: "汉文化博客系统注册"
    })
})
//跳转到个人中心
app.get('/userInfo', (req, resp) => {
    resp.render("user-info", {
        title:"汉文化博客系统个人中心"
    })
})


class Resp {
    constructor(code, msg, data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
    static success(data) {
        return new Resp(2000, "请求成功", data);
    }
    static error(msg) {
        msg = msg ? msg : "请求失败";
       return new Resp(5000, msg, null); 
    }
    static nologin() {
        return new Resp(5010, "用户未登录", null);
    }
}

// -----------------------业务----------------------------
//判断用户信息是否已经存在
app.get('/user/getUserByPhone', async (req, resp) => {
    //调用该方法返回数据库数据
   const use = await user.getUserByPhone(req.query.phone)
   if(use.length > 0) {
       resp.send(Resp.error("用户已存在"))
   } else {
       resp.send(Resp.success(null))
   }

})

//获取验证码
app.get('/getCode', (req, resp) => {
    let code = Math.floor(Math.random() * 10000);
    req.session.code = code
    console.log("code", code);
    resp.send(Resp.success(null))
})

//注册
app.post('/register', (req, resp) => {
    let json = null;
    req.on('data', (chunk) => {
        const str = Buffer.from(chunk).toString()
        json= JSON.parse(str)
    })
    req.on('end',async () => {
        if(json.code != req.session.code) {
            resp.send(Resp.error("验证码错误"))
        } else {
            let password = crypto.createHash('md5').update(json.password + json.phone).digest('hex');
            let d = {phone: json.phone, password}
            let u = await user.add(d)
            console.log(u);
            if(u.affectedRows > 0) {
                resp.send(Resp.success())
            } else {
                resp.send(Resp.error("服务器错误，请稍后再试"))
            }
        }
    })
})

//登录
app.post('/login', (req, resp) => {
   let json = null;
    req.on('data', (chunk) => {
        const str = Buffer.from(chunk).toString()
        json= JSON.parse(str)
    })
    req.on('end', async () => {
        console.log("json:" , json);
        const u = await user.login(json);
        if(u != null) {
            req.session.userId = u.id
            resp.send(Resp.success(u))
        } else {
            // resp.send({code: 5000, msg: "用户名或密码错误", data: null})
            resp.send(Resp.error("用户名或密码错误"))
        }
    })
})
// app.get('/login1', (req, resp) => {
//     console.log(req.session.userId);
//     resp.send(req.session.userId)
// })
//affectedRows
app.get('/addUser', (req, resp) => {
    user.del('15')
    .then(res => {
        console.log(res)
    })
})


//监听服务端端口
app.listen(3000, () => {
    console.log("server is start");
})