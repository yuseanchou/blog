const express = require('express')
const mysql = require('mysql')
const fs = require('fs')
 const app = express();
 app.use('/static', express.static(__dirname + '/static'));

 const dbconfig = {
  database: 'blog',
  user:'root',
  password:'root',
  charset: 'utf8mb4'
}
//封装跳转
 const read = (url)=>{
  return new Promise((resolve,reject) =>{
    fs.readFile(url,(err, data) =>{
      if(err){
        console.log(err)
        reject(err)
      }else{

        resolve(data)
      }
    })
  })
 }
//  跳转首页
  app.get('/',async(req ,resp) =>{
      const data= await read('pages/index.html')
      resp.end(data);
  })
  // 跳转登录
  app.get('/gologin',async(req ,resp) =>{
      const data= await read('pages/login.html')
      resp.end(data);
  })
  const getuserphone =(phone) =>{
    const pool = mysql.createPool()
     pool.getConnection((err,conn) =>{
       if(!err){
         let sql ='select * form t_user'
         const query =conn.query(sql)
         query.on('result',(row,index) =>{
          console.log("row" ,row,"index",index)
         })

       }else{
         console.log(err)
       }
       conn.release();

    })


  }

  app.listen(3000,( )=>{
    console.log("start")
  })