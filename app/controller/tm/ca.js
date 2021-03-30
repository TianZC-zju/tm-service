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





}

module.exports = CAController;
