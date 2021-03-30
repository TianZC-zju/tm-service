'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./router/default')(app);
  require('./router/admin')(app);
  require('./router/stu')(app);
  require('./router/ins')(app);
  require('./router/ca')(app);

};
