'use strict';
const { LoginService, LoginServiceError } = require('./lib/index');

module.exports = app => {
  const weapp = {
    LoginServiceError,
  };
  const { clients, appId, appSecret } = app.config.weappSDK;

  if (clients && Array.isArray(clients) && clients.length) {
    weapp.clients = clients.map((client) => {
        const config = Object.assign({redis: app.redis}, client);
        return {
          config,
          LoginService: LoginService(config),
        };
    });
  } else if (appId && appSecret) {
    const config = { redis: app.redis, appId, appSecret };
    weapp.config = config;
    weapp.LoginService = weapp.LoginService(config);
  } else {
    throw new Error('配置信息错误');
  }

  app.weapp = weapp;

  app.coreLogger.info('[当前 SDK 使用配置] =>', app.config.weappSDK);
  app.coreLogger.info('read data ok');

};
