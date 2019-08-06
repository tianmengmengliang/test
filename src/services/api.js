import { stringify } from 'qs';
import request from '../utils/request';

import {fetch }from './request'
import config from  './config2' //获取token名。
const {token,} = config;


export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addFoundation(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function queryFoundation(params) {
  return request(`/api/foundation?${stringify(params)}`);
}

export async function removeFoundation(params) {
  return request('/api/foundation', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/foundation', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function fakeDetectData() {
  return request('/api/fake_detect_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function queryFakeUserList(params) {
  return request(`/api/fake_user_list?${stringify(params)}`);
}

export async function queryFakeUnitData(params) {
  return request(`/api/fake_unit_data?${stringify(params)}`);
}

export async function queryFakeAfterSaleServiceData(params) {
  return request(`/api/fake_after_sale_service_data?${stringify(params)}`);
}


export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}
 /*export async function  getUserLogin= ( selectedId = {}, callback= ()=>{})=>{
  //console.log("登录请求参数：", selectedId);
  fetch('login/userInfo', {
    data: selectedId,
    success: (res)=>{
      callback && callback(null, res);
    },
    error: (err)=>{
      callback && callback(err, null);
    },
    beforeSend: ()=>{
    },
    complete: (err, res)=>{
    }
  })
};*/


export async function fakeMobileLogin(params) {
  return request('/api/login/mobile', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}
