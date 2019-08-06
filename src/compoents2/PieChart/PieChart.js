/**
 * Created by jpt on 2018/3/23 0023.
 */

/**
 * module: 地图图表模块
 * @module components2/MapChart/MapChart.js
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

import G2 from 'g2';
import DataSet from 'data-set';


import Profiles from '../../profiles/index';
import { ObjectUtilities } from '../../lib/';
import { fetch } from '../../utils/';
import styles from './PieChart.less';

/**
 * module: 饼状图图表模块 class
 * @class
 * @extends Component
 * */
class PieChart extends Component {

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
   * MapChart的构造方法
   * @constructs MapChart
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
      // this.renderChart(nextProps)
    }
  }

  /**
   * 组件将要卸载的生命周期方法
   * @member { function } componentWillUnMount
   * */
  componentWillUnMount() {

  }

  renderChart(props = {}) {
    const { _data = [] } = this.props;
    const { data = [], height, ...rest } = props;

    if (!this.chart) {
      const Frame = G2.Frame;
      const Stat = G2.Stat;
//----------------------------------------------------------------------------------------------------------

      const { View } = DataSet;
      const dv = new View();
      dv.source(data).transform({
        type: 'percent',
        field: 'count',
        dimension: 'item',
        as: 'percent'
      });


      const chart = new G2.Chart({
        container: this.node, //----- div节点
        forceFit: true,
        height: height,
        width: '50%',
        animate: false
      });
      chart.source(dv, {
        percent: {
          formatter: val => {
            val = (val * 100) + '%';
            return val;
          }
        }
      });
      chart.coord('theta', {
        radius: 0.75,
        innerRadius: 0.6
      });
      chart.tooltip({
        showTitle: false,
        itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
      });
      // 辅助文本
      chart.guide().html({
        position: [ '50%', '50%' ],
        html: '<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">总量<br><span style="color:#8c8c8c;font-size:20px">200</span>批</div>',
        alignX: 'middle',
        alignY: 'middle'
      });
      const interval = chart.intervalStack()
        .position('percent')
        .color('item')
        .label('percent', {
          formatter: (val, item) => {
            return item.point.item + ': ' + val;
          }
        })
        .tooltip('item*percent', (item, percent) => {
          percent = percent * 100 + '%';
          return {
            name: item,
            value: percent
          };
        })
        .style({
          lineWidth: 1,
          stroke: '#fff'
        });
      // Step 4: 渲染图表
      chart.render();
      interval.setSelected(dv.rows[0]);
      this.chart = chart;
    }else{
      this.chart.changeData(data);
      this.chart.repaint();
    }
  }

  /**
   * MapChart创建和存在时的生命周期方法
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
    const { prefix = '', cssPrefix = '', data, title, style = {}, className, ..._props  } = this.props;

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
        <p className={styles.title}>{title} </p>
      </div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(MapChart)
 * @default Form.create()(MapChart)
 * */
export default PieChart;
