module.exports = app => {
    const {router, controller} = app
    router.get('/default/index',controller.default.home.index)
    router.get('/default/getBondList',controller.default.home.getBondList)
    router.get('/default/getBondById/:id',controller.default.home.getBondById)
    router.get('/default/getBondListById/:id',controller.default.home.getBondListById)
    router.get('/default/getTypeInfo',controller.default.home.getTypeInfo)
}