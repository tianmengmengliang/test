/**
 * Created by jpt on 2018/4/14 0014.
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'dva'
import { hashHistory } from  'react-router'
import cx from 'classnames'
import { Menu, Icon } from 'antd'
import {returnMenuDataByUserRoles } from './menuSliderData.js'
import {fetch, CONFIG} from 'antd/../../src/services/' //------------------------------ 问题



class MenuSlider extends Component{
  constructor(props){
    super(props);
    this.state={
      openKeys: [],
      selectedKeys:[],
      mode:'inline',
      theme: 'light',
      menuData: [],                                       // 菜单数据
      status: 'loading'                                  // 左侧菜单处于加载状态
    }
  }

  componentWillMount(){}


  componentWillReceiveProps(nextProps){  //用于组件 props 变化后，更新state。
    const {menuSlider: {collapsed}} = nextProps;
    if(collapsed){
      this.setState({
        mode: 'vertical',
        theme: 'light'
      })
    }else{
      this.setState({
        mode: 'inline',
        theme: 'light'
      })
    }
  }

  componentDidMount(){ //
    this.getUserRoles()
  }

  _generateMenu = (menuData)=>{
    let openKeys = [], selectedKeys = [];
    menuData.some((item, i)=>{
      if( !item.children ){ return  false}

      openKeys = [item.key]
      if(item.children instanceof Array){
        item.children.some((item)=>{
          if(item && item.type === 'group'){
            item.children && item.children.some((menuItem)=>{
              selectedKeys.push(menuItem.key);
              return true
            });
          }else{
            selectedKeys.push(item.key);
          }

          return true;
        });
        return true;
      }
    });
    this.setState({
      status: 'done',
      menuData: menuData,
      openKeys,
      selectedKeys
    })
  }

  /*
   * @interface 获取用户角色信息
   * */
  getUserRoles = ()=>{
    const {lsName} = this.props;
    fetch('platform.user.roles', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res = {})=>{
        // step1. 保存用户信息至ls
        const {responseObject = {}} = res;
        const {nameEn} = responseObject[0];
        localStorage.setItem(`${CONFIG.prefix}_${lsName}`, JSON.stringify(res.responseObject));//JSON.stringify()解析出字符串

        // step2. 设置当前用户角色的, 菜单项。
        const menuData = returnMenuDataByUserRoles(nameEn);
        this._generateMenu(menuData)
      },
      error: (err)=>{
        // step1. 展示加载错误UI
        this.setState({
          status: 'error',
          menuData: []
        })
      },
      beforeSend: ()=>{
        this.setState({
          status: 'loading'
        })
      },
      complete: (err, data)=>{
      }
    })
  };

  handleClick=({item,key,keyPath,domEvent})=>{
    // console.log( item, key, keyPath, domEvent);
    keyPath.reverse();
    // hashHistory.push( '/'+keyPath.join('-').replace(/\-/g, '/') );

    // step1. 设置当前选中项
    this.setState({
      selectedKeys: [key]
    });

    // step2. dispatch一个到阿航切换action的派发动作
    const { dispatch } = this.props;
    dispatch({
      type:'nav/changeNav',
      payload:{
        id:`${keyPath[ keyPath.length-2 ] ? keyPath[ keyPath.length-2 ]+'/' : '' }${key}`,
        parentId:keyPath[ keyPath.length-2 ],
        data:{},
        actionType:"click",
        actionEvent:domEvent,
        instance:item,
        parentInstance:item.props.parentMenu,
        cName:item.props.children,
        tag:key
      }
    })
  };

  onOpenChange = (openKeys)=>{
    this.setState({
      openKeys
    })
  };

//-------------------------------------------------------------------------------------------------
  renderMenu =( menusData )=>{
    return menusData.map((item)=>{
      if(item.type === 'group'){
        return (
          <Menu.ItemGroup title={
                                  <span>
                                      <Icon type={ item.iconType }/>
                                      <span className="nav-text">{ item.title }</span>
                                  </span>}>
            { this.renderMenu(item.children)}
          </Menu.ItemGroup>
        )
      }else {
        if (!item.children) {
          return this.renderMenuItem(item)
        }
        return <Menu.SubMenu
          key={item.key}
          title={item.iconType && item.iconType !== '' ?
                                    <span>
                                        <Icon type={ item.iconType }/><span className="nav-text">{ item.title }</span>
                                    </span>
                                    :
                                    item.title}>
          {this.renderMenu(item.children)}
        </Menu.SubMenu>
      }
    })
  };
  renderMenuItem = (item)=>{
    return (
      <Menu.Item key={ item.key } >
        { ( item.iconType && item.iconType !== '' ) ?
          <span>
                        <Icon type={ item.iconType }/>{ item.title }
                      </span>
          :
          item.title
        }
      </Menu.Item>
    )
  };
//------------------------------------------------------------------------------------------------

  render(){
    const {prefix, className, ...props} = this.props;
    const { openKeys, selectedKeys, mode, theme, menuData }=this.state;
    const menu = this.renderMenu(menuData);
    // console.log( menu )

    const cls = cx({
      [`${prefix}-menu-slider-container`]: true
    });
    return (
      <div
        className={`${cls} ${className ? className : ''}`}
        {...props}>
        <Menu
          onClick={this.handleClick}
          onOpenChange={this.onOpenChange}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          theme={theme}
          mode={ mode }
        >
          { menu }
        </Menu>
      </div>
    )
  }
}

MenuSlider.propTypes = {
  prefix: PropTypes.string,
  lsName: PropTypes.string
};

MenuSlider.defaultProps = {
  prefix: 'yzh',
  lsName: 'User_Roles'
};

const mapStateToProps=({menuSlider})=>{
  return {
    menuSlider
  }
};

export default connect(mapStateToProps)(MenuSlider);
