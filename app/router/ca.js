// eslint-disable-next-line strict
module.exports = app => {
    const { router, controller } = app;
    // var adminauth = app.middleware.adminauth()

    router.get('/tm/ca/getAllActivityApplyStu', controller.tm.ca.getAllActivityApplyStu);
    router.get('/tm/ca/getAllActivityApplyCA', controller.tm.ca.getAllActivityApplyCA);
    router.post('/tm/ca/updateActivityStateByActivityId', controller.tm.ca.updateActivityStateByActivityId);

};

