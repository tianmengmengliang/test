import fetch from 'dva/fetch';
import { ObjectUtilities } from '../lib/';
import { notification } from 'antd';
import HOSTS from 'hosts';

function _retTrimValue(value){
  if(!value || typeof value === 'number') return value;
  if(value instanceof Array){
    return value.map((_v)=>{
      return _retTrimValue(_v)
    })
  }
  if(typeof value === 'object'){
    return formTrim(value)
  }
  if(typeof value === 'string'){
    return trim(value)
  }
};

function formTrim(data){
  let _d;
  if(!data || typeof data === 'function' || typeof data !== 'object' ) return data;
  if(data instanceof Array){
    return data.map(value => _retTrimValue(value))
  }
  const keys = Object.keys(data);
  const d = {};
  keys.map((_k)=>{
    d[_k] = _retTrimValue(data[_k])
  });

  return d;
}

function _createHeaderAndData(body = {}, headers = {}){
  const cntType = headers[ 'Content-Type'];
  const _d = formTrim(body);
  let _h = {
    ...headers
  };
  // 如果是formData
  if(headers['Content-Type'].indexOf('multipart\/form-data') > -1){
    return {
      body: _formData(_d),
      headers: _h
    };
    // 如果Content-type为application/json
  }else if(headers['Content-Type'].indexOf('application\/json') > -1){
    return {
      body: JSON.stringify(_d),
      headers: _h
    }
  }
}

function _formData(options){
  let formData = new FormData();
  if(!options || options instanceof Array || typeof options !== 'object'){
    return options
  }
  const keys=Object.keys(options);
  keys.map((key)=>{
    if(options[key]===undefined||options[key]===null) return;
    formData.append(key,options[key])
  });

  return formData
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  /*notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: response.statusText,
  });*/
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseJSON(response) {
  return response.json();
}

/**
 * @function BusinessError - 业务错误对象
 *
 * @param {object} response 返回的响应体
 * */
function BusinessError(response){
  this.name = 'BusinessError';
  this.message = response.msg;
  this.response = response
}


/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    newOptions.body = JSON.stringify(newOptions.body);
  }

  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => response.json())
    .catch((error) => {
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        notification.error({
          message: `请求错误: ${url}`,
          description: error.message,
        });
      }
      return error;
    });
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export function _fetch(url, options) {
  const dislodgeNewOptions = ObjectUtilities.dislodge(options);
  const { method, headers, body, beforeSend, complete, success, error, ...restOptions } = dislodgeNewOptions;
  const newHeaders = {
    // Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  };
  const newOptions = _createHeaderAndData(body, newHeaders);

  const defaultOptions = {
    // credentials: 'include',
  };

  const newMethod = method ? method.toUpperCase() : 'POST';
  const hasBody =  !( newMethod === 'GET' || newMethod === 'HEAD' );
  const _newOptions = {
    method: newMethod,
    headers: newOptions.headers,
    body: hasBody ? newOptions.body : undefined,
    ...defaultOptions,
    ...restOptions
  };

  beforeSend && beforeSend(url, options);
  return fetch(url, _newOptions)
    .then(checkStatus)
    .then(parseJSON)
    .then(response => {
      if( HOSTS.PROXY ) {
        complete && complete(null, response);
        success && success(response)
        return response
      }
      if(response.success){
        complete && complete(null, response);
        success && success(response)
      }else{
        throw new BusinessError(response)
      }
      return response
    })
    .catch((err) => {
      console.log(err);
      if (err.code) {
        /* notification.error({
           message: err.name,
           description: err.message,
         });*/
      }
      if ('stack' in err && 'message' in err) {
        notification.error({
          message: `请求错误: ${url}`,
          description: err.message,
        });
      }
      error && error(err, null);
      return err;
    });
}
