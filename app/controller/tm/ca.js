'use strict';
// eslint-disable-next-line no-unused-vars
const Controller = require('egg').Controller;

class CAController extends Controller {
  async getAllActivityApplyStu() {
    const sql = 'SELECT activity.id as id,' +
            'activity.topic as topic,' +
            'activity.start_time as start_time,' +
            'activity.end_time as end_time,' +
            'edu_institution.name as insName,' +
            'activity.state as state ' +
            'FROM activity, edu_institution  ' +
            'WHERE activity.edu_institution = edu_institution.id ' +
            'AND activity.state in (1, 2, 3)';
    const activityList = await this.app.mysql.query(sql);
    for (let i = 0; i < activityList.length; i++) {
      const sql2 = 'SELECT * FROM course WHERE course.activity=' + activityList[i].id;
      activityList[i].courses = await this.app.mysql.query(sql2);
    }
    this.ctx.body = { activityList };
  }
  async getAllActivityApplyCA() {
    const sql = 'SELECT activity.id as id,' +
            'activity.topic as topic,' +
            'activity.start_time as start_time,' +
            'activity.end_time as end_time,' +
            'activity.description as description,' +
            'edu_institution.name as insName,' +
            'activity.state as state ' +
            'FROM activity, edu_institution  ' +
            'WHERE activity.edu_institution = edu_institution.id ' +
            'AND activity.state in (4, 5, 6)';
    const activityList = await this.app.mysql.query(sql);
    for (let i = 0; i < activityList.length; i++) {
      const sql2 = 'SELECT * FROM course WHERE course.activity=' + activityList[i].id;
      activityList[i].courses = await this.app.mysql.query(sql2);
      let studentList = [];
      for (let j = 0; j < activityList[i].courses.length; j++) {
        const cid = activityList[i].courses[j].id;
        const sql3 = `SELECT student_course.student_id, 
            student_course.score, 
            student_course.course_id,
            course.pass_score, 
            student.name as studentName 
          FROM student_course, student , course 
          WHERE student_course.course_id=${cid} 
          AND student_course.student_id=student.id 
          AND student_course.course_id=course.id `;
        const re = await this.app.mysql.query(sql3);
        studentList = [ ...studentList, ...re ];

      }
      activityList[i].studentList = studentList;
    }
    this.ctx.body = { activityList };
  }
  async updateActivityStateByActivityId() {
    const { activityId, state } = this.ctx.request.body;

    const sql = `UPDATE activity SET  state = ${state}  WHERE id = ${activityId} `;
    const re = await this.app.mysql.query(sql);
    const updateSuccess = re.affectedRows === 1;
    this.ctx.body = {
      updateSuccess,
    };
  }
  async updateActivityRejectReasonByActivityId() {
    const { activityId, reject_reason, state } = this.ctx.request.body;

    const sql = `UPDATE activity SET  reject_reason="${reject_reason}" ,state=${state} WHERE id = ${activityId} `;
    const re = await this.app.mysql.query(sql);
    const updateSuccess = re.affectedRows === 1;
    this.ctx.body = {
      updateSuccess,
    };
  }
  async saveCA() {
    const CAList = this.ctx.request.body;
    const picSrc = 'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3252775fc81c4420bd7be2fe853138ba~tplv-k3u1fbpfcp-watermark.image'
    let insertSuccess = true;
    for (let i = 0; i < CAList.length; i++) {
      const CAItem = CAList[i];
      const re = await this.app.mysql.insert('certificate', {
        picSrc,
        student_id: CAItem.studentId,
        template_id: 1,
        activity_id: CAItem.activityId,
        certification_id: 1,
        chain_info: CAItem.certificateId,
      });
      insertSuccess = insertSuccess && re.affectedRows === 1;
    }
    this.ctx.body = {
      insertSuccess,
    };
  }





}

module.exports = CAController;
