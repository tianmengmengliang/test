
/**
 * module desc
 * @module templates/ComponentTemplate
 * @author
 * @since 2017-08-21
 * @version x.x.x
 * */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';
import Profiles from '../../profiles';
import { fetch } from '../../../services/';
import { ButtonContainer, SearchButton, ResetButton } from '.bin/../../src/components/';

/**
 * some desc
 * @class
 * @extends Component
 * */
class ComponentTemplate extends Component {

  /**
   * @member propTypes 组件属性的类型定义
   * @static
   * @readonly
   * */
  static propTypes = {
    prefix: PropTypes.string.isRequired,
    cssPrefix: PropTypes.string.isRequired,
    data: PropTypes.any,
    // visible: PropTypes.bool.isRequired,
    // callback: PropTypes.func
  };

  /**
   * @member propTypes 组件默认属性
   * @static
   * @readonly
   * */
  static defaultProps = {
    prefix: Profiles.PREFIX,
    cssPrefix: 'component-template',
    data: {},
    // visible: PropTypes.bool.isRequired,
    // callback: PropTypes.func
  };

  /**
   * 根据组件props返回初始化state对象
   * @member _retInitialState
   * @params { object } props - 组件的属性对象
   * @returns { object } 返回初始化state对象
   * @access private
   * */
  _retInitialState = (props = {}) => {
    return {
      spinning: false,
      tip: '',
      initialDataStatus: '',
      listPageStatus: '',
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      }
    }
  };

  /**
   * ComponentTemplate的构造方法
   * @constructs ComponentTemplate
   * @params { object } props - 组件属性集合
   * */
  constructor(props) {
    super(props);
    this.state = this._retInitialState(props)
  }

  /**
   * AlarmSettingsPage创建完成的生命周期方法
   * @member componentDidMount
   * */
  componentDidMount() {

  }

  /**
   * 组件渲染接受到新的属性的生命周期方法
   * @member componentWillReceiveProps
   * @params { object } nextProps - 新的属性对象
   * */
  componentWillReceiveProps(nextProps){

  }

  /**
   * 组件将要卸载的生命周期方法
   * @member { function } componentWillUnMount
   * */
  componentWillUnMount() {

  }

  /*
   * 获取所有查询参数
   * @member _getAllListQuery
   * @param { object } pageQuery - 分页查询对象
   * @return {object} 列表所有查询条件参数对象
   * @access private
   * */
  _getAllListQuery = (pageQuery = {})=>{
    let _values = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      _values = values;
    });

    let _f = {
      ..._values
    };

    return {
      ..._f,
      ...pageQuery
    }
  };

  /**
   * 根据一段时间获取设备数据xhr
   * @member { function } getListPage
   * @params { object } data - 查询参数对象
   * @params { function | null } callback - 回调函数
   * */
  getListPage = (data = {}, callback = null) =>{
    fetch('', {
      // method: 'post',
      // headers: {},
      data: data,
      success: (res)=>{
        callback && callback(null, res);
      },
      error: (err)=>{
        callback && callback(err, null);
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...',
        });
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: '',
        });
      }
    })
  };

  /**
   * 获取设备报警设置页面列表数据action
   * @member {function} getListPageClick
   * @param { object | undefined } query - 额外传入的查询参数
   * @param { function | undefined } callback - 回调函数
   * @param { string } listPageStateName - listPage在state name
   * @param { string } listPageStatusStateName - listPageStatus在state name
   * */
  getListPageClick = (query = {}, callback = null, listPageStateName = "listPage", listPageStatusStateName = "listPageStatus")=>{

    /**
     * @constant { number | undefined } pageIndex - 当前列表页索引
     * @constant { number | undefined } pageSize - 当前列表页的每页大小
     * */
    const { pageIndex, pageSize, ..._props } = query;

    /**
     * @constant { object } selectedDeviceType - 当前选择的设备类型定义的数据结构
     * */
    const { listPage = {} } = this.state;
    const { pageIndex: listPagePageIndex, pageSize: listPagePageSize,} = listPage;

    /**
     * @constant { object } _q - 表单获取查询字段和自定义字段
     * @constant { object } params - 查询参数对象
     * */
    const _q = this._getAllListQuery(query);
    const params = {
      ..._q,
      pageIndex: pageIndex || listPagePageIndex,
      pageSize: pageSize || listPagePageSize,
      ..._props,
    };
    this.getListPage(params, (err, res) => {
      if(err) {
        message.error(err.message || '数据失败');
        return;
      }

      /**
       * @constant { object } listPage - 列表分页数据结构
       * */
      const { responseObject: listPage = {} } = res;
      this.setState({
        [listPageStateName]: {
          ...listPage,
        },
      });

      callback && callback(err, res, { listPageStateName, listPageStatusStateName})
    });
  };

  /**
   * 初始化操作方法
   * @member getInitialDataClick
   * @param { object | undefined } query - 初始化查询参数对象
   * @param { function | undefined } callback - 回调函数-初始化操作
   * @param { object } data - 额外数据
   * */
  getInitialData = (query, callback, data = {}) => {
    this.getListPageClick(query, (err, res)=> {
      callback && callback(err, res, data);
      if(err) {
        this.setState({
          initialDataStatus: 'error'
        });
        return false;
      }else{
        this.setState({
          initialDataStatus: 'success'
        });
        return true;
      }
    }, data.listPageStateName, data.listPageStatusStateName)
  };

  /**
   * 初始化操作方法
   * @member getInitialDataClick
   * @param { object | undefined } query - 初始化查询参数对象
   * @param { function | undefined } callback - 回调函数-初始化操作
   * @param { object } data - 额外数据
   * */
  getInitialDataClick = (query, callback, data) => {
    this.setState({
      initialDataStatus: 'loading',
    });
    this.getInitialData(query, (err, res) => {
      callback && callback(err, res);
      if(err) {
        this.setState({
          initialDataStatus: 'loading',
        });
        return;
      }else{
        this.setState({
          initialDataStatus: 'success',
        });
      }
    }, data)
  };

  /**
   * ComponentTemplate创建和存在时的生命周期方法
   * @member componentDidMount
   * @returns { ReactNode } ReactNode元素
   * */
  render() {

    /**
     * @constant { string } prefix - 前缀
     * @constant { string } cssPrefix - css前缀
     * @constant { object } data - 上一层组件传递过来的数据deviceTypeDef
     * @constant { object } _props - 其他属性集合
     * */
    const { prefix = '', cssPrefix = '', data , style = {}, className, ..._props  } = this.props;

    /**
     * @constant { boolean } spinning - 当前页面加载状态
     * @constant { string } tip - 当前页面加载状态文本
     * @constant { object } listPage - 当前页面列表分页数据结构
     * @constant { Array.<number> } selectedIds - 选择的行数据ids集合
     * @constant { Array.<object> } selectedRows - 选择的行数据集合
     * */
    const { spinning, tip, listPage = {},
      initialDataStatus = '', listPageStatus = '',
      selectedRows } = this.state;
    return (
      <div className={cx(`${prefix}-${cssPrefix}`, className)} {..._props} style={style}></div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(ComponentTemplate)
 * @default Form.create()(ComponentTemplate)
 * */
export default Form.create()(ComponentTemplate);
