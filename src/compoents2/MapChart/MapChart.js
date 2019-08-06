
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

import Profiles from '../../profiles/index';
import { ObjectUtilities } from '../../lib/';
import {fetch, Fxetch } from '../../services/'
/**
 * module: 地图模块 class
 * @class
 * @extends Component
 * */
class MapChart extends Component {

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
      const Stat = G2.Stat; //国家;

      fetch('publics/world_geo_data.json', {
        //method: 'GET',
        //headers: {},
        data: {},
        success: (res)=> {
          //console.log('请求渲染的地图数据==', res);
          //----------------------------------------
          let map = [];
          const mapData = res.data;
          const features = mapData.features;
          for (let i = 0; i < features.length; i++) {
            const name = features[i].properties.name;
            map.push({
              "name": name
            });
          }
          //console.log('地图数据map==', map);

          //------------ 一.渲染地图的div节点 --------------------
          // Step 1: 创建 Chart 对象
          const chart = new G2.Chart({
            container: this.node,  //--------div节点。
            // width: 650,
            height: height,
            plotCfg: {margin: [10, 105]},
            fitForce: true,
            ...rest,
            width: 650,
          });
          chart.legend(false);
          chart.coord('map', { //坐标系的类型。
            projection: 'albers',
            basic: [110, 0, 25, 47], // 指定投影方法的基本参数，[λ0, φ0, φ1, φ2] 分别表示中央经度、坐标起始纬度、第一标准纬度、第二标准纬度
            max: [16.573, -13.613],  // 指定投影后最大的坐标点
            min: [-27.187, -49.739] // 指定投影后最小的坐标点
          });
          chart.tooltip({
            title: null
          });

          //1.draw the map
          const bgView = chart.createView();
          bgView.source(map);
          bgView.tooltip(false);
          bgView.axis(false);
          bgView.polygon()
            .position(Stat.map.region('name', mapData))
            .color('name', function (val) {
              if (val === 'China') {
                return '#C7C7C7';
              } else {
                return '#F0F0F0';
              }
            })
            .style({
              stroke: '#fff',
              lineWidth: 3
            });


          //----------- 二.气泡的位置数据 -------------------------
          fetch('publics/china_pm_data.js', {
            //method: 'GET',
            //headers: {},
            data: {},
            success: (response)=> {
              //-----------------------------------------------------------
              //console.log('气泡数据==', response.data);
              const pointView = chart.createView();
              // Step 2: 载入数据源
              pointView.source(response.data, { //请求气泡分布位置。
                name: {
                  alias: '城市',
                },
                value: {
                  alias: '设备数量'
                }
              });
              pointView.point()    // Step 3：创建图形语法,由 long 和 lant 两个属性决定图形位置，long 映射至 经度，lant 映射至 维度。
                .position(Stat.map.location('long*lant'))
                .size('value', 12, 1)
                .color('#1089ff')
                .tooltip('name*value')
                .shape('circle')
                .style({
                  shadowBlur: 10,
                  shadowColor: '#6A006F'
                });

              // Step 4: 渲染图表
              chart.render();
              this.chart = chart;
            },
            error: (err)=> {
              // step1.
              message.error(err.message);
            },
            beforeSend: ()=> {
              this.setState({
                tableLoading: true
              })
            },
            complete: (err, data)=> {
              this.setState({
                tableLoading: false
              });
            }
          });
          //-------------------------------------------------------------
        },
        error: (err)=> {
          // step1.
        },
        beforeSend: ()=> {
        },
        complete: (err, data)=> {
        }
      });
    } else {
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
      </div>
    )
  }
}

/**
 * some desc
 * @exports Form.create()(MapChart)
 * @default Form.create()(MapChart)
 * */
export default MapChart;
