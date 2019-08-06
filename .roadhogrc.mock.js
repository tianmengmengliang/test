import mockjs from 'mockjs';
import { getCustomServicer, postCustomerServicer } from "./mock/afterSaleService";
import { getRule, postRule } from './mock/rule';
import { getFoundation, postFoundation } from './mock/foundation';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getFakeChartData } from './mock/chart';
import { getFakeDetectData } from './mock/detectData';
import { imgMap } from './mock/utils';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
import { getUnitData } from './mock/unit';
import {  getFakeList as getFakeUserList } from './mock/user';
import { format, delay } from 'roadhog-api-doc';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  // 支持值为 Object 和 Array
  'GET /api/currentUser': {
    $desc: "获取当前用户接口",
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: {
      name: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/dRFVcIqZOYPcSNrlJsqQ.png',
      userid: '00000001',
      notifyCount: 12,
    },
  },

  // GET POST 可省略
  'GET /api/users': [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
     }
  ],
    'GET /api/project/notice': getNotice,
    'GET /api/activities': getActivities,
    'GET /api/rule': getRule,
  'POST /api/rule': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postRule,
  },
  'GET /api/foundation': getFoundation,
  'POST /api/foundation': {
    $params: {
      pageSize: {
        desc: '分页',
        exp: 2,
      },
    },
    $body: postFoundation,
  },
  'POST /api/forms': (req, res) => {
    res.send({ message: 'Ok' });
  },
  'GET /api/tags': mockjs.mock({'list|100': [{ name: '@city', 'value|1-100': 150, 'type|0-2': 1 }]} ),
  'GET /api/fake_list': getFakeList,
  'GET /api/fake_user_list': getFakeUserList,
  'GET /api/fake_unit_data': getUnitData,
  'GET /api/fake_after_sale_service_data': getCustomServicer,
  'GET /api/fake_chart_data': getFakeChartData,
  'GET /api/fake_detect_data': getFakeDetectData,

  //----------- 定义接口、数据源。-------------------------
  'GET /api/fake_chart_data/world_geo_data': {
    success: true,
    data: getFakeChartData.worldGeoData, //数据源。
  },
  'GET /api/fake_chart_data/china_pm_data': {
    success: true,
    data: getFakeChartData.chinaPMData,  //数据源。
  },

  //----------- 本地模拟访问服务器静态文件。--------------------------
  'POST /publics/china_map_data.js': (req, res) => {
    res.send({success: true, code:"CODE_SUCCESS",msg:null, exceptionType: null,
      responseObject: getFakeChartData.chinaMapData});//数据源。chinaMapData
  },
  //----------------- 登录接口 -------------------------------------
  'GET /api/profile/basic': getProfileBasicData,
  'GET /api/profile/advanced': getProfileAdvancedData,
  'POST /api/login/account': (req, res) => {
    const { password, userName } = req.body;
    res.send({ status: password === '888888' && userName === 'admin' ? 'ok' : 'error', type: 'account' });
  },
  //------------------- 登录接口 -----------------------------------
  'POST /api/login/mobile': (req, res) => {
    res.send({ status: 'ok', type: 'mobile' });
  },
  //------------------- 注册接口 -----------------------------------
  'POST /api/register': (req, res) => {
    res.send({ status: 'ok' });
  },
  'GET /api/notices': getNotices,
};

export default noProxy ? {} : delay(proxy, 1000);
