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

export default class LocationForm extends Component {

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
    //console.log("请求参数", _q);
    // step2. 请求列表数据
    fetch('api/device/pageListLocation', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject} = res;
        //console.log("--响应数据:", res.responseObject);
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

    //console.log("--dataSource:", dataSource);
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: 50,
        render: (text, record,i) => {
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
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '经度',
        dataIndex: 'lng',
        key: 'lng',
        width: 100,
        render: (text, record) => {
          return (
            <span>{text}</span>
          )
        },
      },
      {
        title: '纬度',
        dataIndex: 'lat',
        key: 'lat',
        width: 100,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        width: 250,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: 'ip',
        dataIndex: 'ip',
        key: 'ip',
        width: 110,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 150,
        render: (text, record) => {
          return (
            <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
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
            loading={tableLoading}
            //size="small"
            //bordered
            columns={columns}
            rowKey={(record, i)=>{return `${record.id}`}}
            rowClassName={(record) => {return record.editable ? styles.editable : '';}}
            dataSource={dataSource}
            pagination={_pagination}       //分页
            height={400}
            scroll={{x: 1450}}
            //onChange={this.handleGridSort}  //分页、排序、筛选的触发该函数。
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
