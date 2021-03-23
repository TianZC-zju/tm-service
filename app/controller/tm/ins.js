'use strict';
// eslint-disable-next-line no-unused-vars
const Controller = require('egg').Controller;

class StuController extends Controller {

  async newActivity() {
    const activityItem = this.ctx.request.body;
    const re = await this.app.mysql.insert('activity', activityItem);
    const insertSuccess = re.affectedRows === 1;
    this.ctx.body = {
      insertSuccess,
      insertId: re.insertId,
    };
  }
  async newACourse() {
    const { courseItem, selectTeacherList } = this.ctx.request.body;
    const re = await this.app.mysql.insert('course', courseItem);
    let insertSuccess = re.affectedRows === 1;
    if (insertSuccess) {
      for (let i = 0; i < selectTeacherList.length; i++) {
        let re2 = await this.app.mysql.insert('teacher_course', {
          teacher_id: selectTeacherList[i].id,
          course_id: re.insertId,
        });
        insertSuccess = insertSuccess &&  (re2.affectedRows === 1);
      }
    }
    this.ctx.body = {
      insertSuccess,
      insertId: re.insertId,
    };

  }
  async getAllActivityByInsid() {
    const insId = this.ctx.params.id;
    const sql = 'SELECT activity.id as id,' +
        'activity.topic as topic,' +
        'activity.start_time as start_time,' +
        'activity.end_time as end_time,' +
        'activity.state as state ' +
        'FROM activity WHERE activity.edu_institution=' + insId;
    const activityList = await this.app.mysql.query(sql);
    for (let i = 0; i < activityList.length; i++) {
      const sql2 = 'SELECT * FROM course WHERE course.activity=' + activityList[i].id;
      activityList[i].courses = await this.app.mysql.query(sql2);
    }

    this.ctx.body = { activityList };
  }
  async getAllCourseListByInsId() {
    const insId = this.ctx.params.id;
    const sql = 'SELECT * ' +
        'FROM course WHERE course.edu_institution=' + insId;
    const courseList = await this.app.mysql.query(sql);
    for (let i = 0; i < courseList.length; i++) {
      const sql2 = 'SELECT teacher_course.teacher_id as id, ' +
          'teacher.name as name '+
          'FROM teacher_course JOIN teacher ON teacher_course.teacher_id = teacher.id ' +
          'WHERE teacher_course.course_id=' + courseList[i].id;
      courseList[i].teacherList = await this.app.mysql.query(sql2);
    }

    this.ctx.body = { courseList };
  }
  async getAllTeacherAndActivityByInsId() {
    const insId = this.ctx.params.id;
    const sql = 'SELECT activity.id as id,' +
        'activity.topic as topic ' +
        'FROM activity WHERE activity.edu_institution=' + insId;
    const activityList = await this.app.mysql.query(sql);
    const sql2 = 'SELECT teacher_ins.teacher_id as id,' +
        'teacher.name as name ' +
        'FROM teacher_ins  JOIN teacher ON teacher_ins.teacher_id = teacher.id WHERE teacher_ins.edu_institution=' + insId;
    const teacherList = await this.app.mysql.query(sql2);

    this.ctx.body = { activityList, teacherList };
  }

}

module.exports = StuController;
