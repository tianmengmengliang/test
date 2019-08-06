import React from 'react';
import {routerRedux, Router, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import styles from './index.less';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;

//import cloneDeep from 'lodash/cloneDeep';
//import { getNavData } from './common/nav';
//import { getPlainNode } from './utils/utils';
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  //console.log('[routerData路由]', routerData);
  //取得模块。
  const UserLayout = routerData['/'].component;
  const BasicLayout = routerData['/layout'].component;

  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        <Switch>
          <AuthorizedRoute path="/layout" render={props => <BasicLayout {...props} />}
             //authority={['admin', 'user']}
             //redirectPath="/user/register"
          />
          <Route path="/" component={UserLayout} />
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  );
}

export default RouterConfig;
