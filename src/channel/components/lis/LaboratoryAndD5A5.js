/**
 * Created by jpt on 2018/5/10 0010.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Tabs, Button, Input, message, Popconfirm, Divider, Cascader,
  Select, Spin, DatePicker, Modal, notification, Icon, Badge, Menu, Dropdown, } from 'antd';
const TabPane = Tabs.TabPane;
import styles from './modules/style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import {LisLoginModal, AddDeviceTypleModal, AddLaboratoryModal, AddLabAndD5A5Modal, } from './modules/'
import moment from 'moment'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchSampleTypeByValues} from 'antd/../../src/compoents2/location/SampleTypeList.js'; //匹配样本类型

import {fetch,CONFIG, fetchResource}from '../../../services/'



//------------------ 怎么把Json数据 转成Json树状结构! -----------------------------
function fn(data, pid) {
  var result = [], temp;
  for (var i = 0; i < data.length; i++) {
    if (data[i].parentId == pid) {
      var obj = {'id': data[i].id,  'value': data[i].city,  'label': data[i].city, 'parentId': data[i].parentId };
      //----- 递归 -----------------
      temp = fn(data, data[i].id);
      if (temp.length >0){
        obj.children = temp;
      }
      result.push(obj);
    }
  }
  return result;
}
//-------------------------------------------------------------------------------

/**
 * 实验室 和 医嘱。
 * */
class LaboratoryAndD5A5 extends Component {
  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      expandedRowKeys: [],                               // ????
      editTableListPage: {                               // 子表分页。
        pageIndex: 1,
        pageSize: 20,
        rows: [],
        total: 0
      },
      listPage: {                                         //父表分页
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      addLaboratoryModal: {                            // 新建实验室
        title: '添加实验室',
        visible: false,
        data: {}
      },
      addLabAndD5A5Modal:{                             // 新建实验室和医嘱
        title: '实验室选医嘱',
        visible: false,
        data: {}
      },
      residences: [],                                  //省市区
    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  //-------------------- start子表格 ----------------------
  /**
   * @interface 子表格
   */
  expandedRowRender = (_pRecord, index) => {
    //console.log('_pRecord父节点的信息');
    let status, listPage = this.state.editTableListPage;
    const editTableData = this.state[`data-recordId${_pRecord[this.props.rowKey]}`];
    if(editTableData){
      status = editTableData['status'];
      listPage = editTableData['listPage'];
    }
    const {rows: dataSource,} = listPage;
    const isSubmitBtnDisabled = dataSource.some((row)=>{ return row["status"] == 0});//some如果有一个元素满足条件，则表达式返回true。

    const formProps = {size: 'small' };
    const borderStyle= {border:"1px solid #B8CCE2", padding:2, cursor:'pointer'};

    const menu = (<Menu>
      <Menu.Item>
        Action 1
      </Menu.Item>
      <Menu.Item>
        Action 2
      </Menu.Item>
    </Menu> );
    //医嘱列表。
    const columns2 = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 50,
        render: (value, record, i)=>{
          return  i +1
        }
      },
      {
        title: '医嘱中文 ',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '英文名称 ',
        dataIndex: 'nameEn',
        key: 'nameEn',
        width: 80,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 200,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '医嘱类型',
        dataIndex: 'type',
        key: 'type',
        width: 80,
        sortable: false,
        render: (value, record, i)=>{
          //医嘱类型模块
          let _arr =[], text='';
          _arr = searchTextByValues('doctor_advice_type');//模块名称---匹配字典表。
          if(_arr.length > 0){
            _arr.map((item)=>{
              if(value === item.value){
                text = item.text;
                return
              }
            })
          }
          return (
            <span>{text}</span>
          )
        }
      },
      {
        title: '样本类型',
        dataIndex: 'sampleTypeId',
        key: 'sampleTypeId',
        width: 80,
        sortable: false,
        render: (value, record, i)=>{
          let l = searchSampleTypeByValues(value);
          return (
            <span>{l}</span>
          )
        }
      },/*
      {
        title: '删除标志',
        dataIndex: 'deleteFlag',
        key: 'deleteFlag',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          switch(value){
            case 0 :  return (<span style={{color:'#00EA00'}}>{'正常'}</span> );  break;
            case 1 :  return (<span style={{color:'#f00'}}>{'删除' }</span>);  break;
            default :  return (<span style={{color:'#F9A704'}}>{'情况未知' }</span>)
          }
        }
      },*/
      { title: '操作  ',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        render: (value, record, i) => {
          let _record = {
            ...record,
            parentId: _pRecord.id,
          }
          return (
            <span className="table-operation">
                <Button type="primary" size="small" onClick={this.delLabDoctorAdviceClick.bind(this, {data: _record})}>删除</Button>
            </span>
          )
        },
      },
    ];

    return (
      <Spin
        spinning={false}
        tip={`请求数据中`}>
        {status === 'error' ?
          <div className="ant-table-placeholder"><span><i className="anticon anticon-frown-o"></i>获取数据失败</span>
            <div style={{fontSize: 16, fontWeight: 500}}><a onClick={this.getUserLogList.bind(this, _pRecord)}>重新获取数据</a></div>
          </div> :
          <div>
            {/**----------- 父表中每一行记录的子表。---------------*/}
            <Table
              style={{backgroundColor: '#fff'}}
              size="small"
              bordered
              columns={columns2}
              dataSource={dataSource}
              pagination={{pageSize : 5}}
              />
          </div>
        }
      </Spin>
    );
  };

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
    this.getDevicesTypleList({pageIndex, pageSize});

    /***********************************/
    this.getResidencesData((err, res)=> { //1、获取省市区
      if(err){
        message.warn(err.message || `省市区数据失败`);
        return;
      }
      const _data = res.responseObject;
      let dataSource = fn(_data, 0);  //---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历
      this.setState({
        residences: dataSource,
      })
    });
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

      //声明容器
      let Paths= {};
      if(values.residence!== undefined){
        ['country','province','city','area'].forEach((key, index) =>{
          Paths[key] = values.residence[index];
        });
      }
      _f = {
        ...values,
        ...Paths,
      };
    });
    // step1 获取所有查询参数
    return {
      ..._f,
      ...pageQuery
    }
  };

  /*
   * @interface 获取医嘱分页列表
   * */
  getDevicesTypleList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    // step2. 请求列表数据
    fetch('lab/list', {
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
        message.error(err.message||'响应数据失败！');
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

  //---------------------------- onExpand展开应用类型列表( 获取对应的子表数据 ) ------------------------------
  /**
   * @interface 获取列表的某一条记录，对应的子表。
   * @param {object} data  请求参数数据。
   */
  getUserLogList = (data, callback)=>{
    fetch('doctorAdvice/listByLabId', {
      // method: 'post',
      // headers: {},
      data: data,
      success: (res)=>{
        callback && callback(null, res);
      },
      error: (err)=>{
        callback && callback(err, null);
      },
      beforeSend: ()=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data[this.props.rowKey]}`];
        this.setState({
          [`data-recordId${data[this.props.rowKey]}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      },
      complete: (err, res)=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data[this.props.rowKey]}`];
        this.setState({
          [`data-recordId${data[this.props.rowKey]}`]: {
            status: '',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      }
    })
  }

  /**
   * @interface  点击"+"展开列表行的子表。
   * @param {object} record  选中的一行的记录数据。
   * @param {bool} expanded  是否展开。
   */
  onExpand = (expanded, record)=>{
    console.log('--选中的行--', record);
    if(expanded){
      this.getUserLogList({labId: record.id, pageIndex:1, pageSize:999}, (err, res)=>{
        if(err){
          let listPage = this.state.editTableListPage;
          const _data = this.state[`data-recordId${record[this.props.rowKey]}`];
          this.setState({
            [`data-recordId${record[this.props.rowKey]}`]: {
              status: 'error',
              listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
            }
          });
          return
        }
        const {responseObject = {}} = res;

        //响应的数据渲染到每一个子表上。
        this.setState({
          [`data-recordId${record[this.props.rowKey]}`]: {
            status: 'success',
            listPage: responseObject
          },
        })
      })
    }
  };

  /**
   * @interface  记录下选中的行key
   */
  onExpandedRowsChange = (expandedRowKeys)=>{
    this.setState({
      expandedRowKeys: expandedRowKeys
    })
  };
  //--------------------------------------------------------------------------------------------------------------


  //-----------------------------start 新增、修改-------------------------------
  _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
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
  //1.查询省市区接口
  getResidencesData = ( callback=()=>{})=>{ //
    //fetch('area/list', {
    fetchResource('publics/china_map_data.js',{
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        //console.log("----location:----",res);
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
   * @interface 显示添加对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  add = ({type,  data: selectedRows = []})=>{
    if(type === 'add') {
      /***********************************/
      /*this.getResidencesData((err, res)=> { //1、获取省市区
       if(err){
       message.warn(err.message ||`省市区数据失败`);
       return;
       }
       const _data= res.responseObject;
       let dataSource = fn(_data, 0);*/  //---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历

      /***********************************/
      const {residences} = this.state;
      this.showAdd({
        data: {
          residences: residences,
        }
      });

    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
        this.showAdd({
          data: selectedRows[0],
        })
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addLaboratoryModal})=>{
      return {
        addLaboratoryModal: {
          ...addLaboratoryModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addLaboratoryModal})=>{
      return {
        addLaboratoryModal: {
          ...addLaboratoryModal,
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
      //console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDevicesTypleList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
 //-----------------------------------end 新增、修改-------------------------------------



  //-----------------------------------------------start 删除订单----------------------------
  //删除子表
  delLabDoctorAdviceClick = ({data: selectedRows ={}})=>{
      console.log('--子表1--', selectedRows);
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要删除该记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          this.delAdvice({id: selectedRows[this.props.rowKey]}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if(err){
              // case1. 删除失败
              message.error(err.message ||'删除记录失败');
            }else{
              // case2. 重新渲染订单列表
              this.getUserLogList({labId: selectedRows.parentId, pageIndex: 1, pageSize: 999}, (err, res)=> {
                if (err) {
                  let listPage = this.state.editTableListPage;
                  const _data = this.state[`data-recordId${selectedRows.parentId}`];
                  this.setState({
                    [`data-recordId${selectedRows.parentId}`]: {
                      status: 'error',
                      listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
                    }
                  });
                  return
                }
                const {responseObject = {}} = res;

                //响应的数据, 渲染到每一个子表上。
                this.setState({
                  [`data-recordId${selectedRows.parentId}`]: {
                    status: 'success',
                    listPage: responseObject
                  },
                })
              });
            }
          })
        },
        onCancel: ()=> {
        }
      });
  };
  delAdvice = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    console.log('selectedId',selectedId);
    fetch('labDoctorAdvice/remove', {
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
          title: '删除订单中...'
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
 //-----------------------------------------------end 删除子表 --------------------------------------
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
        content: '你确定要删除该记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          this.delOrder({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error(err.message ||'删除记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getDevicesTypleList({pageIndex, pageSize})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  delOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    console.log('selectedId',selectedId);
    fetch('lab/remove', {
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
          title: '删除订单中...'
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

//-----------------------------------------------end 删除订单 --------------------------------------


  //-----------------------------------------------------------
  //实验室和医嘱关系
  viewPOCTBoxClick = ({rowdata: selectedRows})=>{
    console.log('selectedRows',selectedRows);
    this.showViewPOCTBoxModal({data: {...selectedRows}});
  };

  showViewPOCTBoxModal = ({data})=>{ //显示查看对话框
    this.setState(({addLabAndD5A5Modal})=>{
      return {
        addLabAndD5A5Modal: {
          ...addLabAndD5A5Modal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenLabAndD5A5Modal = ()=>{ //隐藏查看对话框
    this.setState(({addLabAndD5A5Modal})=>{
      return {
        addLabAndD5A5Modal: {
          ...addLabAndD5A5Modal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addLabAndD5A5Callback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenLabAndD5A5Modal();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      //console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDevicesTypleList({pageIndex, pageSize});
      this.hiddenLabAndD5A5Modal();
      //console.log("新增一行记录:", data );
      let record = {
        id: data.labId,
      };

      this.onExpand(true, record);
      return;
    }
  };


  //-------------------------------------- 条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getDevicesTypleList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getDevicesTypleList({pageIndex: 1, pageSize})
  };
  //---------------------------------------------------------------------------------


  //----------------------- 复选 ------------------------------
  onSelectChange = (selectedIds, selectedRows) => {
    //console.log('selectedIds changed: ', selectedIds);
    //console.log('selectedRows changed: ', selectedRows);
    this.setState({selectedIds, selectedRows});
  }

  render() {
    const { form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, addDeviceTypleModal, addLaboratoryModal,addLabAndD5A5Modal, residences,
      expandedRowKeys, } = this.state;
    //console.log('rows',rows);

    const rowSelection = {
      //fixed: true,
      selectedIds,  //指定选中项的 key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };

    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//实验室类型模块---匹配字典表。
    lisType = searchTextByValues('lis_type');//lis类型模块---匹配字典表。

    const formEle =( <Form layout="inline">
      <Form.Item>
        {getFieldDecorator('name', {
          rules: false
        })(
          <Input  placeholder="实验室名称" />
        )}
      </Form.Item>
      <Form.Item>
        {getFieldDecorator('code', {
          rules: false
        })(
          <Input  placeholder="实验室编号"/>
        )}
      </Form.Item>

      <Form.Item>
        {getFieldDecorator('type', {
          rules: false
        })(
          <Input  placeholder="实验室类型"/>
        )}
      </Form.Item>
      <Form.Item>
        {getFieldDecorator('residence', {
          rules: false
        })(
          <Cascader options={residences} //size="large"
                    style={{width:300, marginRight:'3%' }}
                    placeholder={`实验室所在地`} />
        )}
      </Form.Item>
      <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
        <Button
          onClick={this.queryClick}
          type="primary"
          icon="search">查询</Button>
        <Button
          onClick={this.resetClick}
          icon="reload">重置</Button>
      </ButtonContainer>
    </Form> );

    const _columns1 = [
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
        title: '实验室名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '实验室编号 ',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '实验室类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          let text= '';
          labType.map((item)=>{
            if(value === item.value){
              text = item.text;
              return   //结束循环。
            }
          })
          return (
            <span>{text}</span>
          )
        }
      },/*{
        title: 'Lis类型',
        dataIndex: 'lisType',
        key: 'lisType',
        width: 80,
        //sortable: true,
        render: (value, record, i)=>{
          let text= '';
          lisType.map((item)=>{
            value = value+'';
            if(value === item.value){
              text = item.text;
              return   //结束循环。
            }
          })
          return (
            <span>{text}</span>
          )
        }
      },*/
      {
        title: '所在地',
        dataIndex: 'place',
        key: 'place',
        width: 180,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{record.country}-{record.province}-
              {record.city}-{record.area} </span>
          )
        }
      },
      /*{
        title: '详细地址',
        dataIndex: 'address',
        key: 'address',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },*/
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 120,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>
              <Button
                type="danger"
                onClick={this.viewPOCTBoxClick.bind(this, {rowdata: record})} size='small'> 添加医嘱 </Button>
              {/*<Divider type="vertical" />*/}
            </span>
          )
        }
      },/*
      {
        title: 'lis账号',
        dataIndex: 'lisAccount',
        key: 'lisAccount',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: 'lis密码',
        dataIndex: 'lisPassword',
        key: 'lisPassword',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: 'lis版本',
        dataIndex: 'lisVersion',
        key: 'lisVersion',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },*/
      /*
       {
       title: '创建时间',
       dataIndex: 'createTime',
       key: 'createTime',
       width: 150,
       //sortable: true,
       render: (value, record, i)=>{
       return (
       <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
       )
       }
       },*/
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
        this.getDevicesTypleList({pageIndex: current, pageSize})
      }
    };

    return (
        <div style={{marginTop: 0,}}>
            {/*1.实验室和医嘱关系 */}
            <div className="hidden">
              <AddDeviceTypleModal {...addDeviceTypleModal} callback={this.viewPOCTBoxCallback}/>
              <AddLaboratoryModal {...addLaboratoryModal} callback={this.addCallback} />
              <AddLabAndD5A5Modal {...addLabAndD5A5Modal} callback={this.addLabAndD5A5Callback} />
            </div>

            <Card bordered={false}>
              <div style={{marginTop:-30, marginBottom:10,}}>{formEle} </div>
              <Spin
                spinning={spinning}
                tip={tip}>
                {/*<ButtonContainer>
                  <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加实验室</Button>
                  <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary" icon="edit">修改</Button>
                  <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger" icon="close">删除</Button>
                </ButtonContainer>*/}
                <Table
                  className="components-table-demo-nested"
                  //className={styles['components-table-demo-nested']}
                  loading={tableLoading}
                  size="small"
                  bordered
                  rowKey={record => record.id}
                  //rowSelection={rowSelection}
                  columns={_columns1}

                  rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
                  expandedRowKeys={expandedRowKeys}  //????
                  expandedRowRender={this.expandedRowRender}
                  onExpand={this.onExpand}   //点击“+”展开
                  onExpandedRowsChange={this.onExpandedRowsChange}

                  dataSource={dataSource}
                  pagination={_pagination}       //分页
                  //scroll={{x:1650,}}               //横向可滚动距离
                />
              </Spin>
            </Card>
        </div>
    );
  }
}

LaboratoryAndD5A5.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
LaboratoryAndD5A5.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

LaboratoryAndD5A5 = Form.create()(LaboratoryAndD5A5);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(LaboratoryAndD5A5);
