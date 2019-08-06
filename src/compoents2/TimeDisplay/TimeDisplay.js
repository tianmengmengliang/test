
/**
 * module: 系统日期时间显示模块
 * @module templates/TimeDisplay/TimeDisplay.js
 * @author lh
 * @since 2017-11-17
 * @version 1.0.0
 * */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';
import Profiles from '../../profiles/index';
import './timeDisplay.less';

/**
 * module: 系统日期时间显示 class
 * @class
 * @extends Component
 * */
class TimeDisplay extends Component {

  /**
   * @member propTypes 组件属性的类型定义
   * @static
   * */
  static propTypes = {
    prefix: PropTypes.string.isRequired,
    cssPrefix: PropTypes.string.isRequired,
    data: PropTypes.any,
    subTitle: PropTypes.string,
  };

  /**
   * @member propTypes 组件默认属性
   * @static
   * @readonly
   * */
  static defaultProps = {
    prefix: Profiles.PREFIX,
    cssPrefix: 'time-display',
    data: {},
  };

  /**
   * @member { number } interval - 定时器间隔时间
   * */
  interval = 1000;

  /**
   * 根据组件props返回初始化state对象
   * */
  _retInitialState = (props = {}) => {
    return {
      currentTime: moment(new Date()), //获取当前系统时间。
      isMounted: true,                 //未卸载标志位。
    }
  };

  /**
   * TimeDisplay的构造方法
   * @constructs TimeDisplay
   * @params { object } props - 组件属性集合
   * */
  constructor(props) {
    super(props);
    this.state = this._retInitialState(props)
  }

  /**
   * 创建完成的生命周期方法
   * @member componentDidMount
   * */
  componentDidMount() {
    //开启定时器
    this.tick();
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
    this.state.isMounted = false;// 3.卸载的时候把标志位设置一下
    if(this.timer !== undefined) {     // 清除定时器
      clearTimeout(this.timer);
    }
  }

  /**
   * @member { function } tick - 定时器开启方法
   * */
  tick = () => {
    this.timer = setTimeout(() => {
      //清除上一次的定时器
      clearTimeout(this.timer);

      if(this.state.isMounted) {// 2.setState时候判断下是否被卸载
        this.setState(({ currentTime }) => {
          currentTime = currentTime.add(this.interval, 'ms')
          return {
             currentTime: currentTime
          }
        });
        this.tick();
      }
    }, this.interval);
  }

  /**
   * TimeDisplay创建和存在时的生命周期方法
   * @member componentDidMount
   * @returns { ReactNode } ReactNode元素
   * */
  render() {
    /**
     * @constant { string } prefix - 前缀
     * @constant { string } cssPrefix - css前缀
     * @constant { object } data - 上一层组件传递过来的数据deviceTypeDef
     * @constant { object } _props - 其他属性集合
     * @constant { string } subTitle - 副标题文本
     * */
    const { prefix = '', cssPrefix = '', data , style = {}, className, subTitle, ..._props  } = this.props;


    /**
     * @constant { moment } currentTime - 当前时间的moment实例
     * */
    const { currentTime } = this.state;
    return (
      <div className={cx(`${prefix}-${cssPrefix}`, className)} {..._props} style={style}>
        <div className={cx(`${prefix}-${cssPrefix}-subtitle`)}><span>{subTitle}</span></div>
        <div className={cx(`${prefix}-${cssPrefix}-date-time-text`)}>
          <div><span>{ currentTime && currentTime.format("YYYY-MM-DD") }</span></div>
          <div><span>{ currentTime && currentTime.format("HH:mm:ss") }</span></div>
        </div>
      </div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(TimeDisplay)
 * */
export default TimeDisplay;
