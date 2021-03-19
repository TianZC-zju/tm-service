'use strict'
const Controller = require('egg').Controller

class MainController extends Controller{
    async index(){
        this.ctx.body = 'hi api'
    }
    async checkLogin(){
        //1.得到前台传过来的用户名和密码
        let username = this.ctx.request.body.username
        let password = this.ctx.request.body.password
        
        //2.写sql语句
        const sql = " SELECT  username,typeid as typeid, id as id FROM client WHERE username = '"+username +
                  "' AND password = '"+password+"'"
        
        //3.直接查询
        const res = await this.app.mysql.query(sql)
        


        //4.判断查询是否成功
        if(res.length>0){
            let openId = new Date().getTime()
            this.ctx.session.openId={'openId':openId}
            this.ctx.body={'data':'登陆成功','openId':openId, 'typeid':res[0].typeid, 'adminId': res[0].id}
        }else{
            this.ctx.body={'data':'登陆失败'}
        }
    }

    async getTypeInfo(){
        const resType = await this.app.mysql.select('type')
        this.ctx.body={data:resType}
    }
    async addBond(){
        let tmpBond = this.ctx.request.body
        let sql = 'SELECT quota.id as id,'+
        'quota.financeid as financeid,'+
        'quota.coreid as coreid,'+
        'quota.totalquota as totalquota ,'+
        'quota.avquota as avquota '+
        'FROM quota '+
        'WHERE quota.coreid='+tmpBond.issuer+' AND quota.avquota>0'
        const result1 = await this.app.mysql.query(sql)
        result1.sort(function(sm,bg){
            return sm.avquota - bg.avquota
        })
        let tav = tmpBond.available
        let haveBond = 0
        let i = 0
        while(tav>result1[i].avquota){
            tmpBond.available = result1[i].avquota
            tmpBond.bankid = result1[i].financeid
            let re = await this.app.mysql.insert('bond', tmpBond)
            let insertSuccess = re.affectedRows===1
            if(insertSuccess) {
                haveBond += result1[i].avquota
                tav -= result1[i].avquota
                result1[i].avquota = 0
                var ree = await this.app.mysql.update('quota',result1[i])
            }
            i +=1
        }
        tmpBond.available = tav
        tmpBond.bankid = result1[i].financeid
        let re = await this.app.mysql.insert('bond', tmpBond)
        let insertSuccess = re.affectedRows===1
        if(insertSuccess) {
            haveBond +=tav
            result1[i].avquota -= tav
            tav =0
            ree = await this.app.mysql.update('quota',result1[i])
        }
        this.ctx.body={
            haveBond:haveBond,
            failBond:tav
        }
    }
    async addQuota(){
        let tmpQuota = this.ctx.request.body
        const result = await this.app.mysql.insert('quota', tmpQuota)
        const insertSuccess = result.affectedRows===1
        const insertId = result.insertId
        this.ctx.body={
            isSuccess:insertSuccess,
            insertId:insertId
        }
    }
    async transferBond(){
        let tmpBond = this.ctx.request.body
        const sql = " SELECT * FROM bond WHERE bond.id="+tmpBond.id
        const res = await this.app.mysql.query(sql)
        if(tmpBond.available == res[0].available){
            res[0].owner = tmpBond.owner
            const result = await this.app.mysql.update('bond', res[0])
            const updateSuccess = result.affectedRows===1
            this.ctx.body={
                isSuccess:updateSuccess
            }

        }else if (tmpBond.available > res[0].available){
            this.ctx.body={
                isSuccess:false
            }
        }else if(tmpBond.available < res[0].available){
            let sum = res[0].available
            res[0].available = sum - tmpBond.available
            const result = await this.app.mysql.update('bond', res[0])
            const updateSuccess = result.affectedRows===1
            res[0].available = tmpBond.available
            res[0].owner = tmpBond.owner
            delete res[0].id
            const result2 = await this.app.mysql.insert('bond', res[0])
            const insertSuccess = result2.affectedRows===1
            this.ctx.body={
                isSuccess:updateSuccess && insertSuccess
            }
        }
        // this.ctx.body={
        //     data: res
        // }
        // res[0].stasus = 1
        // const result = await this.app.mysql.insert('bond', tmpBond)
        // const insertSuccess = result.affectedRows===1
        // const insertId = result.insertId
        // this.ctx.body={
        //     isSuccess:insertSuccess,
        //     insertId:insertId
        // }
    }
    async updateBond(){
        let tmpBond = this.ctx.request.body
        const result = await this.app.mysql.update('bond', tmpBond)
        const updateSuccess = result.affectedRows===1
        this.ctx.body={
            isSuccess:updateSuccess
        }
    }
    async updateQuota(){
        let tmpQuota = this.ctx.request.body
        const result = await this.app.mysql.update('quota', tmpQuota)
        const updateSuccess = result.affectedRows===1
        this.ctx.body={
            isSuccess:updateSuccess
        }
    }
    async register(){
        let tmpuser = this.ctx.request.body
        let sql = "SELECT client.username as username FROM client"
        const resUserName = await this.app.mysql.query(sql)
        this.ctx.body={
            resUserName:resUserName
        }
        let isIN = 0
        for(let i=0;i<resUserName.length;i++){
            if(tmpuser.username == resUserName[i].username){
                isIN = 1
                break
            }
        }

        if(isIN){
            this.ctx.body={
                isSuccess:false,
                haveAUser:true
            }
        }else{
            let sql = "SELECT client.id as id FROM client WHERE client.typeid="+tmpuser.typeid
            let resId = await this.app.mysql.query(sql)


            let newId = 0
            if(resId.length == 0){
                newId=tmpuser.typeid*1000 + 1
            }else{
                resId.sort(function(sm,bg){
                    return bg.id-sm.id
                })
                newId = resId[0].id+1
            }
            
  
            let insertData={id:newId,
                            typeid:tmpuser.typeid,
                            username:tmpuser.username,
                            password:tmpuser.password,
                            mname:tmpuser.name
                        }
            const resClient = await this.app.mysql.insert('client', insertData)
            const clientSuccess = resClient.affectedRows===1  

            let insertData2={id:newId,
                address:"kkkkk",
                type:tmpuser.typeid,
                name:tmpuser.name
                            }
            const resEnterprise = await this.app.mysql.insert('enterprise', insertData2)
            const enterpriseSuccess = resEnterprise.affectedRows===1      

            this.ctx.body={
                isSuccess : enterpriseSuccess&&clientSuccess,
                
                haveAUser : false
            }
            

        }

    }
    async changeBondStasus(){
        
        let tmpbond = this.ctx.request.body
        const sql = " SELECT * FROM bond WHERE bond.id="+tmpbond.id
        let res = await this.app.mysql.query(sql)
        
        //如果付款给银行，需要修改状态为5
        if(tmpbond.stasus==1 && res[0].stasus==3) res[0].stasus=5
        else res[0].stasus = tmpbond.stasus
        
        //if(tmpbond.owner != 0) res[0].owner = tmpbond.owner
        let result = await this.app.mysql.update('bond', res[0])
        let updateSuccess = result.affectedRows===1
        if(tmpbond.stasus == 1 && updateSuccess){
            let coreid = res[0].issuer
            let bankid = res[0].bankid
            const sql2 = " SELECT * FROM quota WHERE quota.coreid="+coreid+" AND quota.financeid="+bankid
            let resQuota = await this.app.mysql.query(sql2)
            resQuota[0].avquota += res[0].available
            let resUpQuota = await this.app.mysql.update('quota',resQuota[0])
            var updateSuccess2 = resUpQuota.affectedRows===1
            updateSuccess = updateSuccess&&updateSuccess2
        }
        this.ctx.body={
             isSuccess:updateSuccess
         }
    }

    async getBondList(){
        let sql = 'SELECT bond.id as id,'+
                 'bond.title as title,'+
                 'bond.introduce as introduce,'+
                 "FROM_UNIXTIME(bond.addTime, '%Y-%m-%d %H:%i:%s' ) as addTime ,"+
                 "FROM_UNIXTIME(bond.endTime, '%Y-%m-%d %H:%i:%s' ) as endTime ,"+
                 'bond.view_count as view_count ,'+
                 '.type.typeName as typeName '+
                 'FROM bond LEFT JOIN type ON bond.type_id = type.Id '+
                 'ORDER BY bond.id DESC'
        const results = await this.app.mysql.query(sql)
        this.ctx.body = {
            bondList:results
        }
      }
      async delBond(){
          let id = this.ctx.params.id
          const res = await this.app.mysql.delete('bond', {'id': id})
          this.ctx.body={data:res}
      }
      async getBondById(){
            let id = this.ctx.params.id
            let sql = 'SELECT bond.id as id,'+
                'bond.issuer as issuer,'+
                'bond.available as available,'+
                'bond.createtime as createTime,'+
                'bond.deadline as deadLine ,'+
                'bond.stasus as stasus,'+
                'enterprise.name as eName ,'+
                'enterprise.type as typeId '+
                'FROM bond LEFT JOIN enterprise ON bond.issuer = enterprise.id '+
                'WHERE bond.owner='+id
            const result = await this.app.mysql.query(sql)
            this.ctx.body={bondList: result}
      }
      async getMyMessage(){
            let id = this.ctx.params.id
            let sql = 'SELECT * FROM client WHERE client.id='+id
                
            const result = await this.app.mysql.query(sql)
            this.ctx.body={myMessage: result[0]}
      }
      async getBondByYhId(){
        let id = this.ctx.params.id
        //不要未付款的和付款给供应商的，状态为不为0和1，银行编号匹配
        let sql = 'SELECT bond.id as id,'+
            'bond.issuer as issuer,'+
            'bond.available as available,'+
            'bond.createtime as createTime,'+
            'bond.deadline as deadLine ,'+
            'bond.stasus as stasus,'+
            'enterprise.name as eName ,'+
            'enterprise.type as typeId '+
            'FROM bond LEFT JOIN enterprise ON bond.issuer = enterprise.id '+
            'WHERE bond.bankid='+id+' AND bond.stasus!=0 AND bond.stasus!=1'
        let result1 = await this.app.mysql.query(sql)


        this.ctx.body={bondList: result1}
  }
    async getQuotaByYhId(){
        let id = this.ctx.params.id
        
        
        let sql = 'SELECT quota.id as id,'+
            'quota.financeid as financeid,'+
            'quota.coreid as coreid,'+
            'quota.createtime as createTime,'+
            'quota.totalquota as totalquota ,'+
            'quota.avquota as avquota,'+
            'enterprise.name as eName '+
            'FROM quota LEFT JOIN enterprise ON quota.coreid = enterprise.id '+
            'WHERE quota.financeid='+id
        const result = await this.app.mysql.query(sql)
        this.ctx.body={bondList: result}
    }
    async getQuotaCoreList(){
        let id = this.ctx.params.id
        let sql = 'SELECT quota.coreid as coreid '+

            'FROM quota '
            'WHERE quota.financeid='+id
        const result = await this.app.mysql.query(sql)
        this.ctx.body={quotaCoreList: result}
    }
    async getAvquotaById(){
        let id = this.ctx.params.id
        let sql = 'SELECT quota.id as id,'+
            'quota.avquota as avquota '+
            'FROM quota '+
            'WHERE quota.coreid='+id
        const result = await this.app.mysql.query(sql)

        let tavquota=0
        for(let i=0;i<result.length;i++){
            tavquota+=result[i].avquota
        }
        this.ctx.body={avquota: tavquota}
    }
    async refreshQuota(){
        let id = this.ctx.params.id
        let sql = 'SELECT * FROM quota WHERE quota.id='+id
        let result = await this.app.mysql.query(sql)

        let tQuota = result[0].totalquota
        let bankid = result[0].financeid
        let coreid = result[0].coreid
        
        let sql2 = 'SELECT bond.available as available '+
        'FROM bond WHERE bond.issuer='+coreid+' AND bond.bankid='+bankid+' AND bond.stasus=0'
        let result2 = await this.app.mysql.query(sql2)
        this.ctx.body={
            result:result2
         }
        let tAvailable =0
        for(let i=0;i<result2.length;i++){
            tAvailable+=result2[i].available
        }
        result[0].avquota = tQuota-tAvailable

        const result3 = await this.app.mysql.update('quota', result[0])
        const updateSuccess = result3.affectedRows===1
        
        this.ctx.body={
             isSuccess:updateSuccess
         }
    }
      async getBondByCoreId(){
        let id = this.ctx.params.id
        let sql = 'SELECT bond.id as id,'+
            'bond.issuer as issuer,'+
            'bond.available as available,'+
            'bond.createtime as createTime,'+
            'bond.deadline as deadLine ,'+
            'bond.stasus as stasus,'+
            'enterprise.name as eName ,'+
            'enterprise.type as typeId '+
            'FROM bond LEFT JOIN enterprise ON bond.issuer = enterprise.id '+
            'WHERE bond.issuer='+id
        const result = await this.app.mysql.query(sql)
        this.ctx.body={bondList: result}
  }
}

module.exports = MainController