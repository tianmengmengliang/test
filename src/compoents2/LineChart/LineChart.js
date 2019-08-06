/**
 * Created by jpt on 2018/3/20 0020.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';
import styles from './LineChart.less';

import G2 from 'g2';
import DataSet from 'data-set';

import Profiles from '../../profiles/index';
import { ObjectUtilities } from '../../lib/';
import { fetch } from '../../utils/';

/**
 * module: 折线图表模块 class
 * @class
 * @extends Component
 * */
class LineChart extends Component {
  /**
   * @member  propTypes 组件属性的类型定义
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
    const { data = [], height, ...rest } = props;

    if (!this.chart){
      const Frame = G2.Frame;
      const Stat = G2.Stat;

      /*const data = [
       { hour: '05:00', Open: 0,  Close: 20 },
       { hour: '06:00', Open: 1.0,  Close: 19 },
       { hour: '07:00', Open: 20.0,  Close: 3.9 },
       { hour: '08:00', Open: 6.9,  Close: 4.2 },
       { hour: '09:00', Open: 9.5,  Close: 5.7 },
       { hour: '10:00', Open: 14.5, Close: 8.5 },
       { hour: '11:00', Open: 18.4, Close: 11.9 },
       { hour: '12:00', Open: 21.5, Close: 15.2 },
       { hour: '13:00', Open: 25.2, Close: 17.0 },
       { hour: '14:00', Open: 26.5, Close: 16.6 },
       { hour: '15:00', Open: 23.3, Close: 14.2 },
       { hour: '16:00', Open: 18.3, Close: 10.3 },
       { hour: '17:00', Open: 13.9, Close: 6.6 },
       { hour: '18:00', Open: 9.6,  Close: 4.8 },
       { hour: '19:00', Open: 9.6,  Close: 4.8 },
       { hour: '20:00', Open: 9.6,  Close: 4.8 }
       ];
      ];*/

      const ds = new DataSet();
      const dv = ds.createView().source(data);
      dv.transform({
        type: 'fold',
        fields: ['Open', 'Close' ], // 展开字段集
        key: 'city', // key字段
        value: 'number', // value字段
      });

        // Step 1: 创建 Chart 对象
        const chart = new G2.Chart({
          container: this.node,  //--------div节点。
          height: height,
          //plotCfg: {margin: [10, 105]},
          forceFit: true,
          ...rest,
          width: 650,
        });

        chart.source(dv, {
          day: {
            range: [ 0,1]
          }
        });
        chart.tooltip({
          crosshairs: {
            type: 'line'
          }
        });
        chart.axis('number', {
          label: {
            formatter: val => {
              return val;
            }
          }
        });
        chart.line().position('day*number').color('city');
        chart.point().position('day*number').color('city').size(5).shape('circle').style({
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
    const { prefix = '', cssPrefix = '', data , style = {}, className, ..._props  } = this.props;

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

          <p className={styles.title}> 设备开关机时效图 </p>
        </div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(LineChart)
 * @default Form.create()(LineChart)
 * */
export default LineChart;
