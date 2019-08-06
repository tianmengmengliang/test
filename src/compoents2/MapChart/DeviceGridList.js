/**
 * Created by jpt on 2018/4/8 0008.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';

import Profiles   from '../../profiles/index';
import { ObjectUtilities } from '../../lib/';
import { fetch }  from '../../services/';

/**
 * module: 豆腐块列表页
 * @class
 * @extends Component
 * */
class DeviceGridList extends Component {

  /**
   * @member propTypes 组件属性的类型定义
   * @static
   * @readonly
   * */
  static propTypes = {
    prefix: PropTypes.string.isRequired,
    cssPrefix: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    height: PropTypes.number,
  };

  /**
   * @member propTypes 组件默认属性
   * @static
   * @readonly
   * */
  static defaultProps = {
    prefix: Profiles.PREFIX,
    cssPrefix: 'map-chart',
    height: 450,
  };



  /**
   * 根据组件props返回初始化state对象
   * @member _retInitialState
   * */
  _retInitialState = (props = {}) => {
    return {

    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState(props)
  }

  /**
   * AlarmSettingsPage 创建完成的生命周期方法
   * @member componentDidMount
   * */
  componentDidMount() {
    this.renderDeviceGridList(this.props);
  }

  /**
   * 组件渲染接受到新的属性的生命周期方法
   * @member componentWillReceiveProps
   * @params { object } nextProps - 新的属性对象
   * */
  componentWillReceiveProps(nextProps){
    // 如果属性发生变化，则重新渲染
    if(!ObjectUtilities.equal(this.props, nextProps)) {
      // this.renderDeviceGridList(nextProps)
    }
  }

  /**
   * 组件将要卸载的生命周期方法
   * @member { function } componentWillUnMount
   * */
  componentWillUnMount() {

  }

  renderDeviceGridList(props = {}) {
    const { data = [], height,  ...rest } = props;
    if (!this.chart) {

    }else{

    }
  }


  render() {
    /**
     * @constant { string } prefix - 前缀
     * @constant { string } cssPrefix - css前缀
     * @constant { object } data - 上一层组件传递过来的数据deviceTypeDef
     * @constant { object } _props - 其他属性集合
     * */
    const { prefix = '', cssPrefix = '', data , style = {}, className,height,  ..._props  } = this.props;

    const _style = Object.assign({}, {height: height,}, style);

    const { currentTime } = this.state;
    return (
      <div ref={(node) => {this.node = node}}
        className={cx(`${prefix}-${cssPrefix}`, className)}
        {..._props}
        style={_style}>
        <p>设备类型: {}</p>
        <span> 设备编号：{}</span>
        <span> 开机状态：{}</span>
        <span> 情况描述：{}</span>
      </div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(DeviceGridList)
 * @default Form.create()(DeviceGridList)
 * */
export default DeviceGridList;
