import moment from 'moment';
import worldGeoJson from './json/world.geo.json';
import chinaPMJson from './json/china-pm.json';

// mock data
const visitData = [];
const beginDay = new Date().getTime();

const fakeY = [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5];
for (let i = 0; i < fakeY.length; i += 1) {
  visitData.push({
    x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
    y: fakeY[i],
  });
}

const visitData2 = [];
const fakeY2 = [1, 6, 4, 8, 3, 7, 2];
for (let i = 0; i < fakeY2.length; i += 1) {
  visitData2.push({
    x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
    y: fakeY2[i],
  });
}

const salesData = [];
for (let i = 0; i < 12; i += 1) {
  salesData.push({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200,
  });
}
const searchData = [];
for (let i = 0; i < 50; i += 1) {
  searchData.push({
    index: i + 1,
    keyword: `机构-${i}`,
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2),
  });
}
const salesTypeData = [
  {
    x: 'CRP',
    y: 4544,
  },
  {
    x: 'PCT',
    y: 3321,
  },
  {
    x: 'HCG',
    y: 3113,
  },
  {
    x: 'AFP',
    y: 2341,
  },
  {
    x: 'PSA',
    y: 1231,
  },
  {
    x: '其他',
    y: 1231,
  },
];

const salesTypeDataOnline = [
  {
    x: 'CRP',
    y: 244,
  },
  {
    x: 'PCT',
    y: 321,
  },
  {
    x: 'HCG',
    y: 311,
  },
  {
    x: 'AFP',
    y: 41,
  },
  {
    x: 'PSA',
    y: 121,
  },
  {
    x: '其他',
    y: 111,
  },
];

const salesTypeDataOffline = [
  {
    x: 'CPR',
    y: 99,
  },
  {
    x: 'PCT',
    y: 188,
  },
  {
    x: 'HCG',
    y: 344,
  },
  {
    x: 'AFP',
    y: 255,
  },
  {
    x: 'PSA',
    y: 65,
  },
];

const offlineData = [];
for (let i = 0; i < 10; i += 1) {
  offlineData.push({
    name: `门店${i}`,
    cvr: Math.ceil(Math.random() * 9) / 10,
  });
}
const offlineChartData = [];
for (let i = 0; i < 20; i += 1) {
  offlineChartData.push({
    x: (new Date().getTime()) + (1000 * 60 * 30 * i),
    y1: Math.floor(Math.random() * 100) + 10,
    y2: Math.floor(Math.random() * 100) + 10,
  });
}

const radarOriginData = [
  {
    name: '个人',
    ref: 10,
    koubei: 8,
    output: 4,
    contribute: 5,
    hot: 7,
  },
  {
    name: '团队',
    ref: 3,
    koubei: 9,
    output: 6,
    contribute: 3,
    hot: 1,
  },
  {
    name: '部门',
    ref: 4,
    koubei: 1,
    output: 6,
    contribute: 5,
    hot: 7,
  },
];

//
const radarData = [];
const radarTitleMap = {
  ref: '引用',
  koubei: '口碑',
  output: '产量',
  contribute: '贡献',
  hot: '热度',
};
radarOriginData.forEach((item) => {
  Object.keys(item).forEach((key) => {
    if (key !== 'name') {
      radarData.push({
        name: item.name,
        label: radarTitleMap[key],
        value: item[key],
      });
    }
  });
});

// 世界地图地理数据
const worldGeoData = worldGeoJson;

// 中国pm数据
const chinaPMData = chinaPMJson;

// mock tableListDataSource
let zhiKongData = [];
for (let i = 0; i < 46; i += 1) {
  zhiKongData.push({
    key: i,
    disabled: ((i % 6) === 0),
    href: 'https://ant.design',
    avatar: ['https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png', 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png'][i % 2],
    deviceSn: parseInt(i / 10) % 2 === 0 ? "JS3000~" + i : "JS1000~" + i,
    no: `TradeCode ${i}`,
    orgName: `机构${i}`,
    area: "浙江省-杭州市-余杭区",
    detectProject: "CPR",
    owner: '曲丽丽',
    originData: "113,123,4234,534,645,656,768",
    callNo: Math.floor(Math.random() * 1000),
    status: Math.floor(Math.random() * 3) ,
    updatedAt: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
    createdAt: new Date(`2017-07-${Math.floor(i / 2) + 1}`),
    progress: Math.ceil(Math.random() * 100),
  });
}

export const getFakeDetectData = {
  worldGeoData,
  chinaPMData,
  visitData,
  visitData2,
  salesData,
  searchData,
  offlineData,
  offlineChartData,
  salesTypeData,
  salesTypeDataOnline,
  salesTypeDataOffline,
  radarData,
  zhiKongData,
};

export default {
  getFakeDetectData,
};
