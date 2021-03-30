'use strict';
// eslint-disable-next-line no-unused-vars
const Controller = require('egg').Controller;

class StuController extends Controller {
  async index() {
    this.ctx.body = 'hi api';
  }
  async checkLogin() {
    // 1.得到前台传过来的用户名和密码
    const username = this.ctx.request.body.username;
    const password = this.ctx.request.body.password;

    // 2.写sql语句
    const sql = " SELECT  username,typeid as typeid, id as id FROM client WHERE username = '" + username +
            "' AND password = '" + password + "'";

    // 3.直接查询
    const res = await this.app.mysql.query(sql);


    // 4.判断查询是否成功
    if (res.length > 0) {
      const openId = new Date().getTime();
      this.ctx.session.openId = { openId };
      this.ctx.body = { data: '登陆成功', openId, typeid: res[0].typeid, adminId: res[0].id };
    } else {
      this.ctx.body = { data: '登陆失败' };
    }
  }
  async updateStuInfo() {
    const id = this.ctx.request.body.id;
    const bodd = this.ctx.request.body;
    const sql = 'SELECT student.id as id,' +
        'student.name as name,' +
        'student.phone as phone,' +
        'student.introduction as introduction,' +
        'student.gender as gender,' +
        'student.avatar as avatar ' +
        'FROM student WHERE student.id=' + id;
    const result1 = await this.app.mysql.query(sql);
    const newRe = { ...result1[0], ...bodd };
    const result3 = await this.app.mysql.update('student', newRe);
    const updateSuccess = result3.affectedRows === 1;
    this.ctx.body = {
      updateSuccess,
    };
  }
  async postActivityByid() {
    const activityId = this.ctx.request.body.activityId;
    const userId = this.ctx.request.body.userId;

    const sql = 'SELECT activity.topic as topic ' +
        'FROM activity WHERE activity.id=' + activityId;
    const result1 = await this.app.mysql.query(sql);
    // const newRe = { ...result1[0], ...bodd };
    // const result3 = await this.app.mysql.update('student', newRe);
    // const updateSuccess = result3.affectedRows === 1;
    this.ctx.body = {
      data:result1,
    };
  }
  async isStuHasActivity() {
    const activityId = this.ctx.request.body.activityId;
    const stuId = this.ctx.request.body.stuId;

    const sql = `SELECT *  
        FROM student_activity 
        WHERE student_activity.student_id=${stuId} 
        AND student_activity.activity_id=${activityId}`;
    const result = await this.app.mysql.query(sql);

    this.ctx.body = {
      result,
    };
  }
  async getCAByStuId() {
    const stuId = this.ctx.request.body.stuId;

    const sql = `SELECT certificate.id, certificate.picSrc, certificate.chain_info, activity.topic,activity.description    
        FROM certificate, activity   
        WHERE certificate.student_id=${stuId} 
        AND certificate.activity_id=activity.id`;
    const activityList = await this.app.mysql.query(sql);

    this.ctx.body = {
      activityList,
    };
  }
  async stuAddActivity() {
    const activityId = this.ctx.request.body.activityId;
    const stuId = this.ctx.request.body.stuId;

    const re = await this.app.mysql.insert('student_activity', {
      student_id: stuId,
      activity_id: activityId,
    });
    let insertSuccess = re.affectedRows === 1;
    const sql2 = `SELECT course.id FROM course WHERE course.activity=${activityId}`
    const courseList = await this.app.mysql.query(sql2);
    for (let i = 0; i < courseList.length; i++) {
      const re2 = await this.app.mysql.insert('student_course', {
        student_id: stuId,
        course_id: courseList[i].id,
        score: 0,
      });
      insertSuccess = insertSuccess && (re2.affectedRows === 1);
    }

    this.ctx.body = {
      insertSuccess,
    };

  }
  async getAllActiviyByState() {
    const state = this.ctx.request.body.state;

    const sql = `SELECT activity.topic,activity.description,activity.seal, activity.id, edu_institution.name 
        FROM activity, edu_institution WHERE activity.state=${state} AND activity.edu_institution=edu_institution.id` ;
    const activityList = await this.app.mysql.query(sql);

    this.ctx.body = {
      activityList,
    };
  }

  async getTypeInfo() {
    const resType = await this.app.mysql.select('type');
    this.ctx.body = { data: resType };
  }
  async getAllActivity() {
    // eslint-disable-next-line no-unused-vars
    // const sql = 'SELECT activity.topic as topic, ' +
    //     'activity.start_time as start_time, ' +
    //     'activity.end_time as end_time, ' +
    //     'activity.id as id, ' +
    //     'activity.state as state, ' +
    //     'course.name as courseName, ' +
    //     'course.pass_score as pass_score ' +
    //     'FROM activity INNER JOIN course ON activity.id = course.activity ' +
    //     'GROUP BY activity.id';
    const sql = `SELECT student_course.\`student_id\` AS sid,student_course.\`course_id\` AS cid,actSelect.id,topic,actSelect.start_time,actSelect.end_time,course.name,score FROM
(( (SELECT * FROM student) AS stSelect JOIN student_course ON student_id=stSelect.id) JOIN course ON course_id=course.id) JOIN (SELECT * FROM activity JOIN student_activity ON activity.id=student_activity.\`activity_id\`
) AS actSelect ON activity=actSelect.id`;
    const result = await this.app.mysql.query(sql);
    this.ctx.body = { data: result };
  }

  async getAllActivityByStuId() {
    const stuId = this.ctx.params.id;
    const sql = 'SELECT student_activity.activity_id as activity_id ' +
        'FROM student_activity WHERE student_activity.student_id=' + stuId;
    const result1 = await this.app.mysql.query(sql);
    // eslint-disable-next-line array-callback-return
    const activityList = [];
    for (let i = 0; i < result1.length; i++) {
      const sql = 'SELECT activity.id as id,' +
          'activity.topic as topic,' +
          'activity.start_time as start_time,' +
          'activity.end_time as end_time,' +
          'activity.state as state ' +
          'FROM activity WHERE activity.id=' + result1[i].activity_id;
      const sql2 = 'SELECT * FROM course WHERE course.activity=' + result1[i].activity_id;
      const activityItem = (await this.app.mysql.query(sql))[0];
      activityItem.courses = await this.app.mysql.query(sql2);
      activityList.push(activityItem);
    }
    this.ctx.body = { activityList };
  }
  async getStuInfoById() {
    const id = this.ctx.params.id;
    const sql = 'SELECT student.id as id,' +
        'student.name as name,' +
        'student.phone as phone,' +
        'student.introduction as introduction,' +
        'student.gender as gender,' +
        'student.avatar as avatar ' +
        'FROM student WHERE student.id=' + id;
    const result1 = await this.app.mysql.query(sql);


    this.ctx.body = { data: result1 };
  }
}

module.exports = StuController;
