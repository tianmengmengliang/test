/**
 * Created by jpt on 2018/4/11 0011.
 */
/**
 * Created by jpt on 2018/4/3 0003.
 */
/**
 * Created by jpt on 2018/3/29 0029.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import cx from 'classnames'
import {Form, Card, Table, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../compoents2/';
import {DeviceRegisterModal, ViewPOCTBoxModal,  AddPOCTBoxModal, DelPOCTBoxModal, UpdataPOCTBoxModal } from './modules/'
import moment from 'moment'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {fetch, } from '../../services/'


//------------------ 怎么把Json数据 转成Json树状结构! -----------------------------
function fn(data, pid) {
  var result = [], temp;
  for (var i = 0; i < data.length; i++) {
    if (data[i].parentId == pid) {
      var obj = {'id': data[i].id,  'value': data[i].id,  'label': data[i].name, 'parentId': data[i].parentId };
      temp = fn(data, data[i].id);
      if (temp.length > 0) {
        obj.children = temp;
      }
      result.push(obj);
    }
  }
  return result;
}
//-------------------------------------------------------------------------------------


class DeviceUnRegister extends Component {
  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      deviceRegisterModal: {                            // 新建
        title: '新设备注册',
        visible: false,
        data: {}
      },
      viewPOCTBoxModal:{
        title: 'poctBOX子模块',
        visible: false,
        data: {}
      },
    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
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
    this.getDeviceRegisterList({pageIndex, pageSize});
  }


  /**
   * 查询及请求参数。
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
  getDeviceRegisterList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    console.log("--请求参数:", _q);
    // step2. 请求列表数据
    fetch('api/device/pageListDeviceInfo', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        console.log("--响应数据:", listPage);
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
    console.log('选中行', rowIdx,'_行数据 ', clickedRow);
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


  //--------------------------------------- 查询设备类型 ---------------------------------
  //2.查询设备类型接口
  getDeviceType = ( callback=()=>{})=>{ //
    fetch('api/device/pageListDeviceType', {
      // method: 'post',
      // headers: {},
      data:{},
      success: (res)=>{
        console.log("--devicTypeGroup:--",res);
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: ''
        })
      }
    })
  };
  //1.查询省市区接口
  getResidencesData = ( callback=()=>{})=>{ //
    fetch('api/device/areaList', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        console.log("----Residences:----",res);
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: ''
        })
      }
    })
  };

  /*
   * @interface 显示添加订单对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  add = ({type,  data: selectedRows = []})=>{
    if(type === 'add') {
      this.getResidencesData((err, res)=> { //1、获取所有专家组
        if(err){
          message.warn(`查询所在地位置不存在`);//可能。
          return;
        }
        const _data= res.responseObject;
        // ---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历
        let dataSource = fn(_data, 0);

        /***********************************/
        this.getDeviceType((err, res)=> { //2.设备类型
          if (err) {
            message.warn(`查询设备类型不存在`);//可能。
            return;
          }
          const _daviceType = res.responseObject;
          /************************************/
          this.showAdd({
            data: {
              residences: dataSource,
              devicTypeGroup: _daviceType,
            }
          });
        });
      });
    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
        this.showAdd({data: selectedRows[0],})
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({deviceRegisterModal})=>{
      return {
        deviceRegisterModal: {
          ...deviceRegisterModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({deviceRegisterModal})=>{
      return {
        deviceRegisterModal: {
          ...deviceRegisterModal,
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
      this.getDeviceRegisterList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
//-----------------------------------end 新增、修改 --------------------------------


//-----------------------------------start 删除订单--------------------------------
  /*
   * @interface 删除一条通知记录
   * */
  delOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      // s1-case1. 只选中一条订单并且订单的状态为未提交status 0
      //let isStatus0 = selectedRows[0]['state'] === 0;
      //if (isStatus0) {
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要删除该设备类型记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          this.delOrder({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error('删除设备类型记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getDeviceRegisterList({pageIndex, pageSize})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  delOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('api/device/deviceTypeDelete', {
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
        /* this.setState({
         spinning: true,
         title: '删除订单中...'
         })*/
      },
      complete: (err, data)=>{
        /* this.setState({
         spinning: false,
         title: ''
         })*/
      }
    })
  };
//------------------------------------end 删除订单 --------------------------------------

  //----------------------------------- 条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getDeviceRegisterList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getCheckNotificationList({pageIndex: 1, pageSize})
  };
  //---------------------------------------------------------------------------------


  //-------------------------------- start poctbox添加模块位置操作-----------------------------------
  //0.查看子模块
  viewPOCTBoxClick = ({selectedRows})=>{
    this.showViewPOCTBoxModal({data: {...selectedRows}});
  };
  showViewPOCTBoxModal = ({data})=>{ //显示查看对话框
    this.setState(({viewPOCTBoxModal})=>{
      return {
        viewPOCTBoxModal: {
          ...viewPOCTBoxModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewPOCTBoxModal = ()=>{ //隐藏查看对话框
    this.setState(({viewPOCTBoxModal})=>{
      return {
        viewPOCTBoxModal: {
          ...viewPOCTBoxModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  viewPOCTBoxCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenViewPOCTBoxModal();
      return;
    }
  };

  // 1.添加子模块
  addPOCTBoxModuleClick = ({dependentValues = {}})=>{
    console.log('---添加模块--', dependentValues);
    /***********************************/
    this.getDeviceType((err, res)=> { //2.设备类型
      if (err) {
        message.warn(`查询设备类型不存在`);//可能。
        return;
      }
      const _daviceType = res.responseObject;
      /************************************/
      this.showAddPOCTBox({data: {...dependentValues, devicTypeGroup: _daviceType,} });
    });
  };
  showAddPOCTBox = ({data})=>{
    this.setState(({addPOCTBoxModal})=>{
      return {
        addPOCTBoxModal: {
          ...addPOCTBoxModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAddPOCTBox = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addPOCTBoxModal})=>{
      return {
        addPOCTBoxModal: {
          ...addPOCTBoxModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addPOCTBoxCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAddPOCTBox();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceRegisterList({pageIndex, pageSize});
      this.hiddenAddPOCTBox();
      return;
    }
  };

  //2.删除模块
  delPOCTBoxModuleClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      // s1-case1. 只选中一条订单并且订单的状态为未提交status 0
      //let isStatus0 = selectedRows[0]['state'] === 0;
      //if (isStatus0) {
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要删除该设备类型记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          this.delOrder({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error('删除设备类型记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getDeviceRegisterList({pageIndex, pageSize})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  showDelPOCTBox = ({data})=>{
    this.setState(({delPOCTBoxModal})=>{
      return {
        delPOCTBoxModal: {
          ...delPOCTBoxModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenDelPOCTBox = ()=>{ //@interface 隐藏订单对话框
    this.setState(({delPOCTBoxModal})=>{
      return {
        delPOCTBoxModal: {
          ...delPOCTBoxModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  delPOCTBoxCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenDelPOCTBox();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceRegisterList({pageIndex, pageSize});
      this.hiddenDelPOCTBox();
      return;
    }
  };

  // 3.修改模块
  updataPOCTBoxModuleClick = ({type,  data: selectedRows = []})=>{
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
    //case1. 只选中一行
    if (hasSelectedOnlyOneIdx) {
      this.showUpdataPOCTBox({data: selectedRows[0],})
    }else{
      return;
    }
  };
  showUpdataPOCTBox = ({data})=>{
    this.setState(({updataPOCTBoxModal})=>{
      return {
        updataPOCTBoxModal: {
          ...updataPOCTBoxModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenUpdataPOCTBox = ()=>{ //@interface 隐藏订单对话框
    this.setState(({updataPOCTBoxModal})=>{
      return {
        updataPOCTBoxModal: {
          ...updataPOCTBoxModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  UpdataPOCTBoxCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenUpdataPOCTBox();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceRegisterList({pageIndex, pageSize});
      this.hiddenUpdataPOCTBox();
      return;
    }
  };
  //--------------------------------- end poctbox添加模块位置操作------------------------------------

  /*
   * @interface 判断期望值与实际值是否相等
   * @param {any} exceptValue 期望值
   * @param {any} realValue 实际值
   * @return {boolean} 如果两个值相等，则返回true否则返回false
   * */
  _isExpectStatusValue = (exceptValue, realValue)=>{
    return exceptValue === realValue
  };

  render() {
    const { form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, deviceRegisterModal, viewPOCTBoxModal,
      addPOCTBoxModal,delPOCTBoxModal,updataPOCTBoxModal } = this.state;
    //console.log('rows',rows);

    const _columns = [
      {
        name: '序号',
        key: 'id',
        width: 50,
        locked: true,
        formatter: ({dependentValues,rowIdx, value})=> {
          const {listPage: {pageIndex, pageSize}} = this.state;
          return (
            <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
          )
        }
      },
      {
        name: '操作',
        key: 'operation',
        width: 200,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
                <span
                  className={`${cx({"hidden": !this._isExpectStatusValue(1, status) })}`}
                  onClick={this.viewPOCTBoxClick.bind(this, {dependentValues})}><a>确认注册</a></span>
              <Divider type="vertical" />
                <span
                  className = {`${cx({"hidden": !this._isExpectStatusValue(1, status)})}`}
                  onClick={this.viewPOCTBoxClick.bind(this, {dependentValues})}><a>删除拉黑</a></span>
              {/*
               <ButtonContainer>
               <Button
               className={`${cx({"hidden": !this._isExpectStatusValue(1, status) })}`}
               type="primary"
               onClick={this.viewPOCTBoxClick.bind(this, {dependentValues})}>确认注册</Button>
               <Divider type="vertical" />
               <Button
               className = {`${cx({"hidden": !this._isExpectStatusValue(1, status)})}`}
               type="danger"
               onClick={this.viewPOCTBoxClick.bind(this, {dependentValues})}>删除拉黑</Button>
               </ButtonContainer>*/}
            </div>
          )
        },
      },
      {
        name: '设备标识号',
        key: 'deviceSn',
        width: 150,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '设备类型',
        key: 'deviceTypeId',
        width: 150,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '日期',
        key: 'createTime',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        },
      },
      {
        name: '是否注册',
        key: 'isRegister',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: 'SIM卡',
        key: 'imsi',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '设备所在地',
        key: 'address',
        width: 150,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
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
        console.log('Current:', current, '; PageSize: ', pageSize);
      },
      onChange: (current) => {
        this.getDeviceRegisterList({pageIndex: current, pageSize})
      }
    };

    return (
      <PageHeaderLayout>
        <div {...props} className="yzh-d-remained-submit-approval has-no-check-box-all">
          <div className="hidden">
            <DeviceRegisterModal
              {...deviceRegisterModal}
              callback={this.addCallback} />
            <ViewPOCTBoxModal
              {...viewPOCTBoxModal}
              callback={this.viewPOCTBoxCallback} />
          </div>


          <Spin
            spinning={spinning}
            tip={tip}>
            {/* 1.查询栏 */}
            <ButtonContainer>
              <Button onClick={this.add.bind(this, {type: 'search', data: selectedRows})} type="primary"><Icon type="search" />查看</Button>
            </ButtonContainer>
            <GridTable
              tableLoading={tableLoading}
              dataSource={dataSource}
              columns={_columns}
              onGridRowsUpdated={this.handleGridRowsUpdated}
              enableRowSelect={true}
              onRowClick = {this.onRowClick}
              rowSelection={
                              {
                                showCheckbox: true,
                                enableShiftSelect: false,
                                onRowsSelected: this.onRowsSelected,
                                onRowsDeselected: this.onRowsDeselected,
                                selectBy:{  keys:{rowKey:'id', values:this.state.selectedIds} }
                              }
                            }
              rowHeight={36}
              minHeight={420}
              rowScrollTimeout={0}
              onGridSort={this.handleGridSort}
              pagination={_pagination}
              scroll={{x: 1350}}               //横向可滚动距离
            />
          </Spin>
        </div>
      </PageHeaderLayout>
    );
  }
}

DeviceUnRegister.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

DeviceUnRegister.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

DeviceUnRegister = Form.create()(DeviceUnRegister);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(DeviceUnRegister);
