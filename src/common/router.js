/**
 * Created by jpt on 2018/6/2 0002.
 */
import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

// 1.判断模块如果不存在时。
const modelNotExisted = (app, model) =>
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic 包装器
const dynamicWrapper = (app, models, component) => {
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if(modelNotExisted(app, model)) {
        app.model( require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
  // add routerData prop
  component: () => {
    if (!routerDataCache) {
      routerDataCache = getRouterData(app);
    }
    return component().then(raw => {
      const Component = raw.default || raw;
      return props =>
        createElement(Component, {
          ...props,
          routerData: routerDataCache,
        });
    });
  },
});
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}


export const getRouterData = app => {
  //1.路由 和 组件匹配
  const routerConfig = {
    '/layout': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/layout/lisCloud/lisProject': {
      component: dynamicWrapper(app, [], () => import('../channel/components/lis/LabProject')),
    },

    //-------------------- lab统计模块 ----------------------------------------------------------
    '/layout/labStat/labNumberStat': {
      component: dynamicWrapper(app, ['chart'], () => import('../channel/components/labStatistics/LabNumberStat')),
    },
    '/layout/labStat/labRecipeStat': {
      component: dynamicWrapper(app, ['chart'], () => import('../channel/components/labStatistics/LabRecipeStat')),
    },
    //-----------------------------------------------------------------------------------------------------------
    //'/layout/labStat/dragtable': {
    //  component: dynamicWrapper(app, [], () => import('../channel/components/labStatistics/DragSortingTable')),
    //},

    '/layout/form/advanced-form': {
      component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/AdvancedForm')),
    },
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () => import('../routes/Exception/triggerException')),
    },

    //---------- 用户个人中心：头像设置。 --------------------------------------------------
    '/layout/UserInformation': {
      component: dynamicWrapper(app, [], () => import('../channel/platform/user/UserInformation')),
    },

    '/': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
  };


  // 1.Get name from ./menu.js
  const menuData=  getFlatMenuData( getMenuData());

  // 2.Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
