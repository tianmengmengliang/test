/**
 * Created by jpt on 2018/3/26 0026.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';
import styles from './SingleLineChart.less';
import G2 from 'g2';


import Profiles from '../../profiles/index';
import { ObjectUtilities } from '../../lib/';
import { fetch } from '../../utils/';

/**
 * module: 开机率-单折线图模块
 * @class
 * @extends Component
 * */
class OpenRateLineChart extends Component {

  /**
   * @member  propTypes 组件属性的类型定义
   * @static
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
   * */
  static defaultProps = {
    prefix: Profiles.PREFIX,
    cssPrefix: 'line-chart',
    height: 450,
  };

  /**
   * @member { G2.Chart } chart - G2.Chart的实例
   * */
  chart = null;

  /**
   * 根据组件props返回初始化state对象
   * @member _retInitialState
   * @params { object } props - 组件的属性对象
   * @returns { object } 返回初始化state对象
   * @access private
   * */
  _retInitialState = (props = {}) => {
    return {

    }
  };

  /**
   * LineChart的构造方法
   * @constructs LineChart
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
    this.renderChart(this.props);
  }

  /**
   * 组件渲染接受到新的属性的生命周期方法
   * @member componentWillReceiveProps
   * @params { object } nextProps - 新的属性对象
   * */
  componentWillReceiveProps(nextProps){
    // 如果属性发生变化，则重新渲染
    if(!ObjectUtilities.equal(this.props, nextProps)) {
      this.renderChart(nextProps);
    }
  }

  /**
   * 组件将要卸载的生命周期方法
   * @member { function } componentWillUnMount
   * */
  componentWillUnMount() {

  }

  renderChart(props = {}) {
    const { data=[], height, ...rest } = props;

    if (!this.chart){
      const Frame = G2.Frame;
      const Stat = G2.Stat;

      // Step 1: 创建 Chart 对象
      const chart = new G2.Chart({
        container: this.node,  //--------div节点。
        height: height,
        forceFit: true,
        ...rest,
      });
      //console.log("_data:", data);

      chart.source(data);
      //----------------- 坐标轴title -----------------------
      chart.axis('statisticalRate', {
        title: {
          textStyle: {
            fontSize: 12, // 文本大小
            textAlign: 'center', // 文本对齐方式
            fill: '#999', // 文本颜色
            // ...
          }
        },
      });
      chart.axis('day', {
        title: {
          textStyle: {
            fontSize: 12, // 文本大小
            textAlign: 'left', // 文本对齐方式
            fill: '#999', // 文本颜色
            // ...
          }
        },
      });
      //----------------------------------------------------
      chart.col('statisticalRate', {
        min: 0,
        alias: '百分比', //坐标轴设置别名。
      });
      chart.col('day', {
        range: [ 0 , 1 ],
        alias: '天'
      });
      //------------------------------------------------------
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.line().position('day*statisticalRate');
      chart.point().position('day*statisticalRate').size(5).shape('circle').style({
        stroke: '#fff',
        lineWidth: 1
      });
      chart.render();
      this.chart = chart;
    }else{
      this.chart.changeData(data);
      this.chart.repaint();
    }
  }

  /**
   * LineChart创建和存在时的生命周期方法
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
    const { prefix = '', cssPrefix = '', data , style = {}, title, className, ..._props  } = this.props;

    /**
     * @constant { number } height - 图表高度
     * */
    const { height } = this.props;

    const _style = Object.assign({}, {
      height: height,
    }, style)

    /**
     * @constant { moment } currentTime - 当前时间的moment实例
     * */
    const { currentTime } = this.state;
    return (
      <div
        ref={(node) => {this.node = node}}
        className={cx(`${prefix}-${cssPrefix}`, className)}
        {..._props}
        style={_style}>

        <p className={styles.title}> {title}</p>
      </div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(LineChart)
 * @default Form.create()(LineChart)
 * */
export default OpenRateLineChart;
