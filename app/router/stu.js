// eslint-disable-next-line strict
module.exports = app => {
  const { router, controller } = app;
  // var adminauth = app.middleware.adminauth()
  router.get('/admin/index', controller.admin.main.index);
  router.post('/admin/checkLogin', controller.admin.main.checkLogin);
  router.post('/tm/updateStuInfo', controller.tm.stu.updateStuInfo);
  router.post('/tm/postActivityByid', controller.tm.stu.postActivityByid);
  router.post('/tm/getAllActiviyByState', controller.tm.stu.getAllActiviyByState);
  router.post('/tm/isStuHasActivity', controller.tm.stu.isStuHasActivity);
  router.post('/tm/stuAddActivity', controller.tm.stu.stuAddActivity);
  router.post('/tm/getCAByStuId', controller.tm.stu.getCAByStuId);
  router.get('/tm/getStuInfoById/:id', controller.tm.stu.getStuInfoById);
  router.get('/tm/getAllActivityByStuId/:id', controller.tm.stu.getAllActivityByStuId);
  router.get('/tm/getAllActivity', controller.tm.stu.getAllActivity);

};
