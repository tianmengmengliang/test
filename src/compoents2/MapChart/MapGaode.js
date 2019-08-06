/**
 * Created by jpt on 2018/4/8 0008.
 */

/**
 * module: 地图图表模块
 * @module components2/MapChart/MapGaode.js
 * @author jiapengtao
 * @since 2018-4-8
 * @version 1.0.0
 * */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';


import Profiles from '../../profiles/index';
import { ObjectUtilities } from '../../lib/';
import { fetch, CONFIG } from '../../services/';

/**
 * module: 高德地图
 * @class
 * @extends Component
 * */
class MapGaode extends Component {

  /**
   * @member propTypes 组件属性的类型定义
   * */
  static propTypes = {
    prefix: PropTypes.string.isRequired,
    cssPrefix: PropTypes.string.isRequired,
    height: PropTypes.number,
  };

  /**
   * @member propTypes 组件默认属性
   * */
  static defaultProps = {
    prefix: Profiles.PREFIX,
    cssPrefix: 'map-chart',
    height: 450,
  };


  _retInitialState = (props = {}) => {
    return {
      gaodeConfig:{
         resizeEnable: true,
         zoom:11,
         center: [120.182912, 30.243878],//杭州
      }
    }
  };


  constructor(props) {
    super(props);
    this.state = this._retInitialState(props)
  }

  componentDidMount() {
    this.renderChart(this.props);
  }

  componentWillReceiveProps(nextProps){
    // 如果属性发生变化，则重新渲染
    if(!ObjectUtilities.equal(this.props, nextProps)) {
      this.renderChart(nextProps)
    }
  }

  renderChart(props ={}) {
    const { height, dataSource =[]} = props;
    //遍历json
    var lnglats = [];
    if(dataSource.length >0 ){//判断数组是否存在，必须要做。
      dataSource.map((key)=> {
        const _array = [];
        ['lng', 'lat'].map((sn)=> {
          if (key.sn !== null || key.sn !== undefined) {
            _array.push(parseFloat(key[`${sn}`]));
          }
        })
        lnglats.push(_array);
      });
    }
    //console.log('lnglats', lnglats);


    var AMap = window.AMap; //取出window中的AMap对象
    var map = new AMap.Map(this.mapContent, {resizeEnable: true}); // 创建AMap实例
     /*var lnglats = [
      [107.160664, 34.349131],//宝鸡
      [108.946119, 34.259919],//西安
      [114.082062, 32.129005],//信阳
      [120.182912, 30.243878],//杭州
    ];*/

    var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
    for(var i=0, marker; i<lnglats.length; i++){
      var marker = new AMap.Marker({
        position: lnglats[i],
        map: map,
      });
      marker.content= `<div class='Window'>
                               <div>设备编号: <b>${dataSource[i].deviceNo}</b></div>
                               <div>设备状态: <b>${dataSource[i].status} </b></div>
                               <div>地址: ${dataSource[i].address}</div>
                               <a href='#' class='s_pay'></a></div>`

      marker.on('click', markerClick);
      marker.emit('click', {target: marker});
    }

    function markerClick(e){
      infoWindow.setContent(e.target.content); //给多个点添加信息窗体。
      infoWindow.open(map, e.target.getPosition());
    }
    map.setFitView();
  }

  render() {
    /**
     * @constant { string } prefix - 前缀
     * @constant { string } cssPrefix - css前缀
     * @constant { object } _props - 其他属性集合
     * */
    const { prefix = '', cssPrefix = '', style = {}, className, height, ..._props} = this.props;

    const _style = Object.assign({}, { height: height,}, style)
    const { currentTime } = this.state;
    return (
      <div className={cx(`${prefix}-${cssPrefix}`, className)}
        ref={(mapContent) => {this.mapContent = mapContent}}
        style={_style}>
      </div>
    )
  }
}


MapGaode.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string,
  dataSource: PropTypes.arrayOf(PropTypes.object),                         //.isRequired 数据源数组。
};

MapGaode.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id',

};
/**
 * some desc
 * @exports Form.create()(MapGaode)
 * @default Form.create()(MapGaode)
 * */
export default MapGaode;
