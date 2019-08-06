/**
 * Created by jpt on 2018/3/20 0020.
 */
import React, { PureComponent, Fragment, Component, PropTypes, } from 'react';
import {Card, Table, Button, Input, message, Popconfirm, Divider,Select,Spin, Modal, notification, Icon, } from 'antd';
import styles from './style.less';
import moment from 'moment'
//import {fetch,} from 'antd/../../src/utils/'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import fetch from '../../services/request.js'

export default class TestInfoForm extends Component {

  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      title: '',                                          // 页面加载数据loading状态文字
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      }
    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getEventList({pageIndex, pageSize});
  }


  _getAllListQuery = (pageQuery = {})=>{
    // step1 获取所有查询参数
    return {
      ...pageQuery
    }
  };

  /*
   * @interface 获取列表
   * */
  getEventList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    console.log("请求参数", _q);
    // step2. 请求列表数据
    fetch('api/device/pageListTestInfo', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject} = res;
        console.log("--响应数据:", res.responseObject);
        this.setState({
          listPage:{
            ...responseObject
          }
        })
      },
      error: (err)=>{
        // step1.
        message.error(err.message);
      },
      beforeSend: ()=>{
        this.setState({
          tableLoading: true
        })
      },
      complete: (err, data)=>{
        this.setState({
          tableLoading: false
        })
      }
    })
  };




  render() {
    const {...props} =this.props;
    const { listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, } = this.state;

    console.log("--dataSource:", dataSource);
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: 50,
        render: (text, record, i) => {
          return (pageIndex - 1) * pageSize + i +1
        },
      },
      {
        title: '设备标识',
        dataIndex: 'deviceSn',
        key: 'deviceSn',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '设备编号',
        dataIndex: 'deviceNo',
        key: 'deviceNo',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: 'type_id',
        dataIndex: 'deviceTypeId',
        key: 'deviceTypeId',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '模块编号',
        dataIndex: 'moduleNo',
        key: 'moduleNo',
        width: 100,
        render: (text, record) => {
          return (
            <span>{text}</span>
          )
        },
      },
      {
        title: '测试表ID',
        dataIndex: 'testNo',
        key: 'testNo',
        width: 300,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '附件文件名',
        dataIndex: 'attchFiles',
        key: 'attchFiles',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '患者姓名',
        dataIndex: 'patientName',
        key: 'patientName',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '患者性别',
        dataIndex: 'sex',
        key: 'sex',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '身份证',
        dataIndex: 'idCard',
        key: 'idCard',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '证件类型',
        dataIndex: 'idCardType',
        key: 'idCardType',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '板条检测编号',
        dataIndex: 'wattleStackProjectId',
        key: 'wattleStackProjectId',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '板条批号',
        dataIndex: 'wattleStackLotNo',
        key: 'wattleStackLotNo',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '方法学',
        dataIndex: 'wattleStackMethod',
        key: 'wattleStackMethod',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '定标曲线',
        dataIndex: 'wattleStackCalibrationData',
        key: 'wattleStackCalibrationData',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '板条最大量',
        dataIndex: 'wattleStackMaxCount',
        key: 'wattleStackMaxCount',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '样本检测项目编号',
        dataIndex: 'samProjectId',
        key: 'samProjectId',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '质控编号',
        dataIndex: 'samLotNo',
        key: 'samLotNo',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '机型',
        dataIndex: 'sampleType',
        key: 'sampleType',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '样品编号',
        dataIndex: 'sampleNo',
        key: 'sampleNo',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '样本检测状态',
        dataIndex: 'samStatus',
        key: 'samStatus',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '试剂项目编号',
        dataIndex: 'reagentProjectNo',
        key: 'reagentProjectNo',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '试剂批号',
        dataIndex: 'reagentLotNo',
        key: 'reagentLotNo',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '试剂方法学',
        dataIndex: 'reagentMethod',
        key: 'reagentMethod',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },{
        title: '批内序号',
        dataIndex: 'reagentIndex',
        key: 'reagentIndex',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '剩余次数',
        dataIndex: 'reagentRemain',
        key: 'reagentRemain',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '生产时间',
        dataIndex: 'reagentProductDate',
        key: 'reagentProductDate',
        width: 150,
        render: (text, record) => {
          return (
            <span>{text ? moment(text).format('YYYY-MM-DD') : undefined}</span>
          )

        },
      },
      {
        title: '过期时间',
        dataIndex: 'reagentValidDate',
        key: 'reagentValidDate',
        width: 150,
        render: (text, record) => {
          return (
            <span>{text ? moment(text).format('YYYY-MM-DD') : undefined}</span>
          )
        },
      },
    ];

    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: true,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current: ', current, '; PageSize: ', pageSize);
      },
      onChange: (current) => {
        this.getEventList({pageIndex: current, pageSize})
      }
    };
    return (
      <PageHeaderLayout title="详情页">
        <Card bordered={false}>
        <Table
          style={{ marginBottom: 8 }}
          loading={this.state.tableLoading}
          size="small"
          //bordered
          columns={columns}
          rowKey={(record, i)=>{return `${record.id}`}}
          rowClassName={(record) => {
                        return record.editable ? styles.editable : '';
                    }}
          dataSource={dataSource}
          pagination={_pagination}       //分页
          height={400}
          scroll={{x: 2700}}
          //onChange={this.handleGridSort}  //分页、排序、筛选的触发该函数。
        />
        </Card>
      </PageHeaderLayout>
    );
  }
}
