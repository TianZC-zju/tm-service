// eslint-disable-next-line strict
module.exports = app => {
  const { router, controller } = app;
  // var adminauth = app.middleware.adminauth()

  router.post('/tm/newActivity', controller.tm.ins.newActivity);
  router.post('/tm/newACourse', controller.tm.ins.newACourse);
  router.get('/tm/getAllActivityByInsid/:id', controller.tm.ins.getAllActivityByInsid);
  router.get('/tm/getAllCourseListByInsId/:id', controller.tm.ins.getAllCourseListByInsId);
  router.get('/tm/getAllTeacherAndActivityByInsId/:id', controller.tm.ins.getAllTeacherAndActivityByInsId);


};
