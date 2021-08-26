const {db} = require('../utils/dbconn')
module.exports = {
    //用户电话查询用户
    getUserByPhone: async (phone) => {
        let sql = 'select * from t_user where phone = ?'
        let sqlParams = [phone]
        return await db(sql, sqlParams)
    },
    //获取所有用户信息
    getAll:async () => {
        let sql = 'select * from t_user where is_del = 0'
        return await db(sql)
    }, 
    //添加用户信息
    insert: async (user) => {
        // user= {}
        let sql = 'insert into t_user set ?'
        return await db(sql, user)
    },
    //更新用户信息
    update: async (arr) => {
        //[{}, id]
        let sql = 'update t_user set ? where id=?'
        return await db(sql, arr)
    },
    //删除用户信息
    del: async(id) => {
        arr = [{is_del: 1}, id]
        this.update(arr);
    }
}