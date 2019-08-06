/**
 * Created by jpt on 2018/6/2 0002.
 */
import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: '实验室基础资料',
    icon: 'cloud',
    path: 'lisCloud',
    children: [
      {
        name: '项目库',
        icon: 'appstore-o',
        path: 'lisProject',
      },
    ],
  },
  {
    name: '统计分析',
    icon: 'table',
    path: 'labStat',
    children: [
      {
        name: '业务总量统计',
        path: 'labNumberStat',
      },
      {
        name: '业务趋势统计',
        path: 'labRecipeStat',
      },
    ],
  },

  {
    name: '账户',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: '登录',
        path: 'login',
      },
      {
        name: '注册',
        path: 'register',
      },
      {
        name: '注册结果',
        path: 'register-result',
      },
    ],
  },
];


/**
 * 1.格式化菜单栏。
 * */
function formatter(data, parentPath='/layout/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path; //路由拼接。
    }
    const result = {
      ...item,
      path,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData= () => formatter(menuData);
