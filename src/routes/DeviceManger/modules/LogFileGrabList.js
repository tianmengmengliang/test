/**
 * Created by jpt on 2018/4/23 0023.
 */
/**
 * Created by jpt on 2018/4/23 0023.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, Badge,  } from 'antd';
import styles from './../style.less';
import { GridTable, ButtonContainer, MapGaode, } from '../../../compoents2/';
import moment from 'moment'
import {fetch, } from '../../../services/'

const statusMap = ['default', 'processing', 'success', 'error'];

function noop(){}
class LogFileGrabList extends Component {
  _retInitialState = ()=>{
    return {
      devicTypeGroup: [],
      tableTitle: '日志抓取记录',
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 20,
        rows: [],
        total: 0
      },
      deviceLogGrabModal: {                            // 新建
        title: '取设备的运行日志文件',
        visible: false,
        data: {}
      },
    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  componentWillReceiveProps(nextProps){ //当组件传入的 props变化时调用，更新state。
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {LogFileListLoading} = this.props;
    console.log('LogFileListLoading',LogFileListLoading);
      if(LogFileListLoading ){
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getDeviceLogFileList({pageIndex, pageSize});
      }
      /* 步骤一、回调父组件callback函数。*/
      this.props.callback && this.props.callback();
  }

  /* @interface 清空行选择数据
   * * */
  resetSelectedRowsNIds = ()=>{
    this.setState({
      selectedIds: [],
      selectedRows: []
    })
  };



  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getDeviceLogFileList({pageIndex, pageSize});
  }

  /**
   * 1.查询及请求参数。
   **/
  _getAllListQuery = (pageQuery = {})=>{
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      _f = { ...values};
    });
    // step1 获取所有查询参数
    return {
      ..._f,
      ...pageQuery
    }
  };

  /*
   * @interface 获取设备注册列表
   * */
  getDeviceLogFileList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    //console.log("--请求参数:", _q);
    // step2. 请求列表数据
    fetch('api/device/pageListLogDownloadTask', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        //console.log("--响应数据:", listPage);
        this.setState({
          listPage
        });
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

  /*
   * @interface 表格排序
   * @param {string} sortColumn 排序的列的key
   * @param {string} sortDirection 排序的方向
   * */
  handleGridSort(sortColumn, sortDirection) {
    //console.log('sortColumn',sortColumn,' sortDirection',sortDirection);
    const comparer = (a, b) => {
      // 1.从小到大。
      if (sortDirection === 'ASC') {
        return (a[sortColumn] < b[sortColumn]) ? 0 : -1;  //0 升序
      }
      // 2.从大到小。
      else if (sortDirection === 'DESC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1;  //1 降序
      }
    };
  };

  //----------------- start 选中行------------------------------------------------
  /*
   * @interface Grid  1.行更新
   * */
  handleGridRowsUpdated = ({fromRow, toRow, updated })=> {
    console.log('handleGridRowsUpdated',arguments)
    let rows = this.state.rows;

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
      rows[i] = updatedRow;
    }

    this.setState({ rows });
  };

  /*
   * @interface 2.选中行接口
   * @param {Array} 选中的行
   * */
  onRowsSelected = (rows ) =>{ /*新增选择的行*/
    console.log('选中行接口', rows);
    this.setState( {
      selectedIds: rows.map(r => r.row[this.props.rowKey])
    });
    this.setState({
      selectedRows: rows.map(r => r.row)
    });
  };

  /*
   * @interface 3.取消选中行接口
   * @param {Array} 取消选中的行
   * */
  onRowsDeselected = (rows /*取消选择的行*/) =>{
    console.log('取消选中行接口', rows);
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({
      selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )
    });
    this.setState({
      selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )
    });
  };

  /**
   * @interface 4.选行--中接口
   * */
  onRowClick = (rowIdx, clickedRow)=>{
    //console.log('选中行', rowIdx,'_行数据 ', clickedRow);
    // case1. 如果是全选操作，跳过会自动调用onRowsSelected方法，如果是单选操作请隐藏全选checkbox视图操作
    if(rowIdx === -1){
      return;
    }
    // case2. 不是全选操作
    const hasSelected =  this.state.selectedRows.some((item)=>{
      return item[this.props.rowKey] === clickedRow[this.props.rowKey]
    });

    if(hasSelected){
      let rowIds = clickedRow[this.props.rowKey];
      console.log('选中rowIds', rowIds );

      this.setState({
        selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )
      });
      this.setState({
        selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )
      });
    }else{
      // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
      this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
      this.setState({selectedRows: [clickedRow]});
    }
  };
  //------------------ end -------------------------------------------


  //-----------------------------start 新增、修改-------------------------------
  /*
   * @interface 判断是否只选中一行数据
   * @param {array} selectedIds 选中的行数组
   * return {boolean} 只选中一行数据返回true否则返回false
   * */
  _hasSelectedOnlyOneIdx = (selectedIds=[], nullText = undefined, moreText = undefined)=>{
    if(selectedIds.length === 0){
      // s1-case1. 没有选中任何行数据提示
      message.warn(`${nullText || '你未选中任何记录'}`);
      return false
    }else if(selectedIds.length > 1 ){
      // s1-case2. 选中超过2行数据提示
      message.warn(`${moreText || '你只能选择一条记录'}`);
      return false;
    }
    return true
  };

  /*
   * @interface 显示添加订单对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  add = ({type,  data: selectedRows ={}})=>{
    if(type === 'add') {
    }
    if(type === 'edit') {

    }
  };
  showAdd = ({data})=>{
    this.setState(({deviceLogGrabModal})=>{
      return {
        deviceLogGrabModal: {
          ...deviceLogGrabModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({deviceLogGrabModal})=>{
      return {
        deviceLogGrabModal: {
          ...deviceLogGrabModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceLogFileList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
  //-----------------------------------end 新增、修改 --------------------------------

  //-------------------------------- start文件下载 -----------------------
  downloadDeviceLog({ record={}}){
    this.downloadOrder({id: record.id}, (err, res)=>{
      if(err){
        const key = `open${Date.now()}`;
        notification.error({
          message: '下载失败',
          description: `原因：${err.message || '未知'}`,
          key,
          onClose: noop,
        });
        return;
      }
      const {responseObject}=  res;
      console.log('【文件下载路径】',responseObject);
      //文件下载。
      // 方法一：window.open()
      window.open(`${responseObject}`);

    })
  }
  downloadOrder = (selectedId = {}, callback = ()=>{})=>{
    fetch('api/device/logDownload', {
      // method: 'post',
      // headers: {},
      data: selectedId,
      success: (res)=>{
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          title: '确认订单中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          title: ''
        })
      }
    })
  };


  render() {
    const { form,} =this.props;
    const { getFieldDecorator } = form;
    const {devicTypeGroup, tableTitle, listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, deviceLogGrabModal,  } = this.state;
    //console.log('devicTypeGroup',devicTypeGroup);

    const status = ['关闭', '运行中', '已上线', '异常'];
    const _columns = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 50,
        render: (value, record, i)=>{
          return (pageIndex - 1) * pageSize + i +1
        }
      },
      {
        title: '设备编号',
        dataIndex: 'deviceNo',
        key: 'deviceNo',
        width: 100,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value ? value : '' }</span>
          )
        }
      },
      {
        title: '任务状态',
        dataIndex: 'taskStatus',
        key: 'taskStatus',
        width: 100,
        render: (val, record, i)=>{ //0未开始:红，1开始中:蓝,  2完成:绿.  4.黄色，
         switch(val){
            case 0 :  return (<span style={{color:'#f00'}}>{'未开始'}</span> );  break;
            case 1 :  return (<span style={{color:'#0066ff'}}>{'进行中' }</span>);  break;
            case 2 :  return (<span style={{color:'#00EA00'}}>{'完成' }</span>  );  break;
            case 3 :  return (<span style={{color:'#ff0000'}}>{'中断！' }</span>  );  break;
            default :  return (<span style={{color:'#F9A704'}}>{'情况未知' }</span>)
          }
           {/*
            filters: [
            {
            text: status[0],
            value: 0,
            },
            {
            text: status[1],
            value: 1,
            },
            {
            text: status[2],
            value: 2,
            },
            {
            text: status[3],
            value: 3,
            },
            ],
           return  <Badge status={statusMap[val]} text={status[val]} />;*/}
        }
      },
      {
        title: '日志起止日期',
        dataIndex: 'taskStartTime',
        key: 'taskStartTime',
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{record.taskStartTime ? moment(record.taskStartTime).format('YYYY-MM-DD') : undefined }&nbsp;-
              &nbsp;{record.taskEndTime ? moment(record.taskEndTime).format('YYYY-MM-DD') : undefined }</span>
          )
        }
      },
      {
        title: '文件',
        dataIndex: 'taskFileAddress',
        key: 'taskFileAddress',
        width: 100,
        render: (value, record, i)=>{
          //如果value为null, 那么三原运算就为 false;
          return (
            <span>{value ?  <a><span onClick={this.downloadDeviceLog.bind(this, {record})}><Icon type="folder" style={{fontSize:24, color:'#06f'}}/></span></a>
              : <Icon type="folder" style={{fontSize:24, color:'#F9A704'}}/> }</span>
          )
        }
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 100,
        sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined }</span>
          )
        }
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
        console.log('Current:', current, '; PageSize: ', pageSize);
      },
      onChange: (current) => {
        this.getDeviceMangerList({pageIndex: current, pageSize})
      }
    };

    return (
          <Card title={tableTitle} bordered={false} >
            <Spin spinning={spinning} tip={tip}>
            <Table
              style={{ marginBottom: 8 }}
              loading={tableLoading}
              //size="small"
              bordered
              columns={_columns}
              rowKey={(record, i)=>{return `${record.id}`}}
              rowClassName={(record) => {return record.editable ? styles.editable : ''; }}
              dataSource={dataSource}
              pagination={_pagination}       //分页
              height={400}
              scroll={{x: 850}}
              //onChange={this.handleGridSort}  //分页、排序、筛选的触发该函数。
            />
            </Spin>
          </Card>
    );
  }
}

LogFileGrabList.propTypes = {
  LogFileListLoading: PropTypes.bool,
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

LogFileGrabList.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id',

};

LogFileGrabList = Form.create()(LogFileGrabList);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(LogFileGrabList);
