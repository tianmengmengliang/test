import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import logo   from '../../public/assets/img/logo.svg';
import userHead  from 'antd/../../public/assets/img/image5.jpg';
//--------------------------------------------------------------------
import {fetch, CONFIG } from '../services/';
const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 *  根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach( getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  // 定义sessionstorage中众多 key。
  static area_key = {
    area_key: 'area_key',
    d_Typekey: 'd_Type_key',
    Dic_listkey: 'Dic_list_key',
    s_Typekey: 'sample_key',
  }

  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  state = {
    isMobile,
  };
  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  }
  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });
    /*this.props.dispatch({  //数据流：请求当前用户头人信息。
      type: 'user/fetchCurrent',
    }); */

    //设置浏览器缓存.
    if(sessionStorage.opened){
      console.log('窗口是刷新页面,不是新打开')
    }else{
      //console.log('窗口是新打开')
      this.getAdviceTypeData();
      this.getSampleTypeData();
    }
  }


  /* 1.加载字典表的数据 */
  getAdviceTypeData= ()=>{
    fetch('dic/list', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        //console.log("----字典表数据", res.responseObject);
        const jsonStr1 = JSON.stringify( res.responseObject); //json转字符串。
        //const area = JSON.parse( jsonStr1); //字符串转json
        sessionStorage.setItem( BasicLayout.area_key.Dic_listkey, jsonStr1);
      },
      error: (err)=>{
        message.warn(err.message||`加载字典表出错`);
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: ''
        })
      }
    });
  }
  /* 2.加载sampleType的数据 */
  getSampleTypeData= ()=>{
    fetch('sampleType/list', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        //console.log("----加载sampleType的数据", res.responseObject);
        const jsonStr1 = JSON.stringify( res.responseObject); //json转字符串。
        sessionStorage.setItem(BasicLayout.area_key.s_Typekey, jsonStr1);
      },
      error: (err)=>{
        message.warn(`加载sampleType数据出错`);
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: ''
        })
      }
    });
  }


  componentWillUnmount(){
    unenquireScreen( this.enquireHandler);
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '中翰云平台';
    let currRouterData = null;
    // match params path
    Object.keys(routerData).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = routerData[key];
      }
    });
    if (currRouterData && currRouterData.name) {
      title = `${currRouterData.name} - 即检云平台`;
    }
    return title;
  }

  //关键点：控制重定向路由
  getBashRedirect = () => {
    // 这里是重定向的,重定向到 url 的 redirect参数所示地址
    const urlParams = new URL( window.location.href);
    const redirect = urlParams.searchParams.get('redirect');
    //console.log("urlParams：", urlParams);
    //
    if(redirect){
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    }
    else{
      const { routerData } = this.props;
      //console.log("routerData：", routerData);
      //find() 方法返回通过测试（函数内判断）的数组的第一个元素的值。
      //find() 方法为数组中的每个元素都调用一次函数执行：
      const authorizedPath = Object.keys(routerData).find(
        item => check(routerData[item].authority, item) && item !== '/layout'
      );
      //console.log("authorizedPath：", authorizedPath);
      return authorizedPath;
    }
    return redirect;
  };

  handleMenuCollapse = collapsed => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };
  handleNoticeClear = type => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  };

  handleMenuClick = ({ key }) => {
    if (key === 'user') { //个人中心
      this.props.dispatch( routerRedux.push('/layout/UserInformation'));
      return;
    }
    if (key === 'triggerError') { //触发报错
      this.props.dispatch( routerRedux.push('/layout/exception/trigger'));
      return;
    }
    if (key === 'logout') {      //退出登录
      //this.props.dispatch({ type: 'login/logout',}); //a.使用数据流--> models --> 请求路由。
      this.props.dispatch( routerRedux.push('/'));    //b.直接切换路由。
      this.loginOut();
    }
  };

  handleNoticeVisibleChange = visible => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  };

  loginOut = ()=>{
    localStorage.setItem(`${CONFIG.token}`, '')
    localStorage.setItem(`${CONFIG.lsNames.platform.USER_ROLE}`, '')
  };

  render() {
    const {
      collapsed,
      loadingNotices,  //是否处于加载状态。
      notices, //数据源。
      routerData,
      match, location,} = this.props;
    const bashRedirect = this.getBashRedirect();
    //console.log("BasicLayout重定向路由：", bashRedirect);

    let userInfo = JSON.parse( localStorage.getItem(`${CONFIG.lsNames.platform.USER_ROLE}`));
    // 用户信息。
    const currentUser = {
        name:  userInfo.name ? userInfo.name: '小明',
        avatar: 'https://ss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/image/pic/item/2f738bd4b31c870159e1881b2b7f9e2f0608fffc.jpg',
        userid: userInfo.id ? userInfo.id: '00001',
        notifyCount: 12,
    }

    const layout = (
      <Layout>
        {/* 一.左导航 */}
        <SiderMenu
          logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          Authorized={Authorized}
          menuData={getMenuData()}
          collapsed={collapsed}
          location={location}
          width={168}
          isMobile={this.state.isMobile}
          onCollapse={this.handleMenuCollapse}
        />

        {/* 二.右视图页面 */}
        <Layout>
          <Header style={{ padding: 0 }}>
            <GlobalHeader
              logo={logo}
              currentUser={currentUser}
              fetchingNotices={loadingNotices}
              notices={notices}
              collapsed={collapsed}
              isMobile={this.state.isMobile}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
            />
          </Header>
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            {/* 按顺序从上往下，去和浏览器url匹配。*/}
            <Switch>
                  {redirectData.map(item => (
                    <Redirect key={item.from} exact from={item.from} to={item.to} />
                  ))}
                  {getRoutes(match.path,  routerData).map(item => (
                    <AuthorizedRoute
                      key={item.key}
                      path={item.path}
                      component={item.component}
                      exact={item.exact}
                      authority={item.authority}
                      redirectPath="/layout/exception/403"
                    />
                  ))}
                  <Redirect exact from="/layout"  to={bashRedirect}  // "/layoutdashboard/analysis"
                  />
                  <Route render={NotFound} />
            </Switch>
          </Content>

          <Footer style={{ padding: 0 }}>
            <GlobalFooter
              links={[
                {
                  key: 'Pro 首页',
                  title: 'Pro 首页',
                  href: 'http://pro.ant.design',
                  blankTarget: true,
                },
                {
                  key: 'github',
                  title: <Icon type="github" />,
                  href: 'https://github.com/ant-design/ant-design-pro',
                  blankTarget: true,
                },
                {
                  key: 'Ant Design',
                  title: 'Ant Design',
                  href: 'http://ant.design',
                  blankTarget: true,
                },
              ]}
              copyright={
                <Fragment>
                  Copyright <Icon type="copyright" /> 2018 互联网产品部出品
                </Fragment>
              }
            />
          </Footer>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(({global, loading }) => ({
  collapsed: global.collapsed,
  loadingNotices: false,       //loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(BasicLayout);
