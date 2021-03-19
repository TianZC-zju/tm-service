module.exports = app => {
    const {router, controller} = app
    //var adminauth = app.middleware.adminauth()
    router.get('/admin/index',controller.admin.main.index)
    router.post('/admin/checkLogin',controller.admin.main.checkLogin)
    router.get('/admin/getTypeInfo',controller.admin.main.getTypeInfo)
    router.post('/admin/addBond',controller.admin.main.addBond)
    router.post('/admin/addQuota',controller.admin.main.addQuota)
    router.post('/admin/transferBond',controller.admin.main.transferBond)
    router.post('/admin/updateBond',controller.admin.main.updateBond)
    router.post('/admin/register',controller.admin.main.register)
    router.post('/admin/updateQuota',controller.admin.main.updateQuota)
    router.post('/admin/changeBondStasus',controller.admin.main.changeBondStasus)
    router.get('/admin/getBondList',controller.admin.main.getBondList)
    router.get('/admin/getMyMessage/:id',controller.admin.main.getMyMessage)
    router.get('/admin/delBond/:id',controller.admin.main.delBond)
    router.get('/admin/getBondById/:id',controller.admin.main.getBondById)
    router.get('/admin/getBondByYhId/:id',controller.admin.main.getBondByYhId)
    router.get('/admin/getQuotaByYhId/:id',controller.admin.main.getQuotaByYhId)
    router.get('/admin/getAvquotaById/:id',controller.admin.main.getAvquotaById)
    router.get('/admin/getQuotaCoreList/:id',controller.admin.main.getQuotaCoreList)
    router.get('/admin/refreshQuota/:id',controller.admin.main.refreshQuota)
    router.get('/admin/getBondByCoreId/:id',controller.admin.main.getBondByCoreId)
}