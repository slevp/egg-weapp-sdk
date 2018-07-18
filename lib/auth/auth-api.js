'use strict';

const co = require('co');
const constants = require('./constants');
const AuthAPIError = require('./auth-api-error');
const uuid = require('../helper/uuid');
const jscode2sessionFactroy = require('../helper/jscode2session');

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

module.exports = (config) => {
  const jscode2session = jscode2sessionFactroy(config);

  return {
    login: co.wrap(function* (code, encrypt_data, iv) {
      const session = yield jscode2session.getSessionKey(code);
      const data = yield jscode2session.decrypt(session.sessionKey, encrypt_data, iv);
      const redis = config.redis;

      const token = uuid();
      const value = JSON.stringify(data);
      yield redis.set(token, value, 'PX', ONE_MONTH);

      return {
        id: token,
        skey: 'bravo',
        user_info: data,
      };
    }),

    checkLogin: co.wrap(function* (id, skey) {
      if (skey !== 'bravo') {
        const error = new AuthAPIError(constants.RETURN_CODE_WX_SESSION_FAILED, constants.ERR_LOGIN_FAILED);
        throw error;

      }
      const redis = config.redis;
      const res = yield redis.get(id);
      const value = res ? JSON.parse(res) : null;
      return { user_info: value };
    }),
  }
};
