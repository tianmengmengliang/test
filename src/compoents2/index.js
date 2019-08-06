/**
 * module: 自定义组件的入口模块
 * @module component2/index.js
 * @author lh
 * @since 2017-11-16
 * @version 1.0.0
 * */

import TimeDisplay from './TimeDisplay';
import LineChart from './LineChart';
import {MapChart, DeviceGridList, MapGaode, }from './MapChart/';
import {SingleLineChartModal, SingleLineChart, OpenRateLineChart, ExceptionRateLineChart }  from './SingleLineChart/';
import PieChart from './PieChart';

import {AddButton, DelButton, EditButton,
  ExportButton, UploadButton, ButtonContainer,SearchButton, ResetButton } from './button/'
import {GridTable, BodyGridTable} from './gridTable/'
import {ModalA, ModalContent} from './modalA/'

/**
 * 导出 module: 自定义组件的入口模块
 * @exports
 * */
export {
  // btn: 添加btn
  AddButton,
  // btn: 删除btn
  DelButton,
  // btn: 编辑btn
  EditButton,
  // btn: 导出btn
  ExportButton,
  // btn: 上传btn
  UploadButton,
  // btn: 查询btn
  SearchButton,
  // btn: 重置btn
  ResetButton,
  // btn: 按钮
  ButtonContainer,
  GridTable,
  BodyGridTable,
  ModalA,
  ModalContent,

  // 日期时间显示组件
  TimeDisplay,
  // 地图图表模块, //设备列表  //高德
  MapChart, DeviceGridList, MapGaode,
  // 开机/关机双折线图。
  LineChart,
  //折线图。
  SingleLineChart, OpenRateLineChart, ExceptionRateLineChart,
  // 圆饼图。
  PieChart,

};
