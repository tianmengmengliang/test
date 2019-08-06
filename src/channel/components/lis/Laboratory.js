/**
 * Created by jpt on 2018/5/10 0010.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Tabs, Button, Input, message, Popconfirm, Divider, Cascader,
  Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
//import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import {LisLoginModal, AddDeviceTypleModal, AddLaboratoryModal, AddLabAndD5A5Modal,AddLabAndRecipeModal,ViewLabDetailModal,} from './modules/'
import LaboratoryAndD5A5 from './LaboratoryAndD5A5'
import moment from 'moment'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch, CONFIG, fetchResource,} from '../../../services/'

import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表


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
 *
 * */
class Laboratory extends Component {
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
      addLaboratoryModal: {                            // 新建实验室
        title: '实验室信息',
        visible: false,
        data: {}
      },
      addLabAndD5A5Modal:{                             // 实验室和医嘱
        title: '实验室和医嘱',
        visible: false,
        data: {}
      },
      addLabAndRecipeModal:{                           // 实验室选套餐
        title: '实验室选套餐',
        visible: false,
        data: {}
      },
      viewLabDetailModal:{                           // 实验室的医嘱、套餐。
        title: '查看实验室已选套餐、医嘱。',
        visible: false,
        data: {}
      },

      activeKey: '1',
      residences: [],                                  //省市区
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
   * @interface 获取实验室分页列表
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

  //----------------- start 选中行------------------------------------------------
  /*
   * @interface Grid  1.行更新
   * */
  handleGridRowsUpdated = ({fromRow, toRow, updated })=> {
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
    //console.log('选中行接口', rows);
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
      //console.log('选中rowIds', rowIds );
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
  getResidencesData = ( callback=()=>{})=>{
    //fetch('area/list', {
    fetchResource('publics/china_map_data.js',{ //访问服务器静态文件。
      //method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
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
        const {residences} = this.state;
        this.showAdd({
          data: {
            ...selectedRows[0],
            residences: residences,
          }
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
      this.resetSelectedRowsNIds();
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDevicesTypleList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
//-----------------------------------end 新增、修改-------------------------------------



//-----------------------------------------------start 删除订单--------------------------------
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


  //------------------------------------------- start 选医嘱对话框. --------------------------------------------
  //1.查询已选的所有医嘱。（这里要不分页接口）
  getSelectedADListBylabId = (selectedId={}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('lab/getDoctorAdviceByLabId',{
      // method: 'post',
      // headers: {},
      data: {...selectedId, pageIndex:1, pageSize:1000},
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

  /*
   *  实验室选医嘱对话框。
   * */
  addDoctorAdviceClick = ({rowdata:selectedRows,})=>{
     //step.1 根据labId,查已选医嘱。
    this.getSelectedADListBylabId({id: selectedRows.id }, (err, res = {})=> {
      if (err) {
        message.error('查询已选医嘱失败');
        return;
      }
      const _listPage = res.responseObject;
      let _rows =[], _selectedId=[];
       _rows = _listPage.rows;
      if(_rows.length >0){
        _rows.forEach((item)=>{
          _selectedId.push(item.id);
        })
      }
      console.log('已选id_selectedId',_selectedId);
      this.showViewPOCTBoxModal({data: {...selectedRows,  selectedIds :_selectedId,}});
    });
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
      return;
    }
  };

  //------------------------------------- start 选套餐对话框. --------------------------------------------------

  //1.查询已选的所有套餐。（这里要不分页接口）
  getSelectedReListBylabId = (selectedId={}, callback = ()=>{})=>{
    fetch('labRecipe/listByLabId',{
      // method: 'post',
      // headers: {},
      data: {...selectedId, pageIndex:1, pageSize:1000},
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
  /*
   * 实验室选套餐对话框。
   * */
  addRecipeClick = ({rowdata: selectedRows})=>{
    //step.1 根据labId,查已选医嘱。
    this.getSelectedReListBylabId({id: selectedRows.id }, (err, res = {})=> {
      if (err) {
        message.error('查询已选医嘱失败');
        return;
      }
      const _listPage = res.responseObject;
      let _rows = [], _selectedId = [];
      _rows = _listPage.rows;
      if (_rows.length > 0) {
        _rows.forEach((item)=> {
          _selectedId.push(item.id);
        })
      }
      //step.2  传递数据 labId, 已选医嘱。
      this.showRecipeModal({data: {...selectedRows, selectedIds: _selectedId,}});
    });

  };
  showRecipeModal = ({data})=>{ //显示查看对话框
    this.setState(({addLabAndRecipeModal})=>{
      return {
        addLabAndRecipeModal: {
          ...addLabAndRecipeModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenRecipeModal = ()=>{ //隐藏查看对话框
    this.setState(({addLabAndRecipeModal})=>{
      return {
        addLabAndRecipeModal: {
          ...addLabAndRecipeModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addLabAndRecipeCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenRecipeModal();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      //console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDevicesTypleList({pageIndex, pageSize});
      this.hiddenRecipeModal();
      return;
    }
  };
  //-----------------------------------------------------------

  /**
   * 实验室已选的--项目和套餐。
   * */
  viewLabDetailClick = ({rowdata: selectedRows})=>{
    this.showLabDetailModal({data: {...selectedRows}});
  };
  showLabDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewLabDetailModal})=>{
      return {
        viewLabDetailModal: {
          ...viewLabDetailModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenLabDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewLabDetailModal})=>{
      return {
        viewLabDetailModal: {
          ...viewLabDetailModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addLabDetailCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenLabDetailModal();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      //console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDevicesTypleList({pageIndex, pageSize});
      this.hiddenLabDetailModal();
      return;
    }
  };
  //-----------------------------------------------------------

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

  /*
   * @interface 点击tabPane的回调
   * @param {string} 点击的tabPane的key
   * */
  onTabClick = (tabPaneKey)=>{
    this.setState({
      activeKey: tabPaneKey,
    })
  };

  render() {
    const { form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, addDeviceTypleModal, addLaboratoryModal, addLabAndD5A5Modal,addLabAndRecipeModal,viewLabDetailModal,
      activeKey, residences,} = this.state;
    //console.log('rows',rows);

    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//实验室类型---匹配字典表。
    //console.log("labType",labType);
    lisType = searchTextByValues('lis_type');//lis类型---匹配字典表。
    //console.log("lisType",lisType);

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
          <Input  placeholder="类型"/>
        )}
      </Form.Item>

      <Form.Item>
        {getFieldDecorator('residence', {
          rules: false
        })(
          <Cascader options={residences} //size="large"
                    style={{width:200, marginRight: '3%' }}
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

    const _columns = [
      {
        name: '序号',
        key: 'index',
        width: 50,
        locked: true,
        formatter: ({dependentValues,rowIdx, value})=> {
          const {listPage: {pageIndex, pageSize}} = this.state;
          return (
            <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
          )
        }
      },
      /*{
        name: '操作',
        key: 'operation',
        width: 100,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <ButtonContainer>
                <Button
                type="danger"
                onClick={this.viewPOCTBoxClick.bind(this, {rowdata: dependentValues})} size='small'> 添加医嘱 </Button>
                <Divider type="vertical" />
              </ButtonContainer>
            </div>
          )
        },
      },*/
      {
        name: '实验室名称',
        key: 'name',
        width: 150,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '实验室编号',
        key: 'code',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '实验室类型',
        key: 'type',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
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
        },
      },
      {
        name: '所在地',
        key: 'place',
        width: 250,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{dependentValues.country}-{dependentValues.province}-
              {dependentValues.city}-{dependentValues.area} </span>
          )
        },
      },
      {
        name: '详细地址',
        key: 'address',
        width: 150,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: 'lis账号',
        key: 'lisAccount',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: 'lis密码',
        key: 'lisPassword',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: 'lis版本',
        key: 'lisVersion',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: 'Lis类型',
        key: 'lisType',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          let text= '';
          lisType.map((item)=>{
            if(value === item.value){
              text = item.text;
              return   //结束循环。
            }
          })
          return (
            <span>{text}</span>
          )
        },
      },
      /*{
        name: '操作',
        key: 'operation',
        width: 350,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <Button
                type="primary"
                onClick={this.addDoctorAdviceClick.bind(this, {rowdata: dependentValues})} size='small'><Icon type="plus"/>添加医嘱</Button>
              <Divider type="vertical" />
              <Button
                type="primary"
                onClick={this.addRecipeClick.bind(this, {rowdata: dependentValues})} size='small'><Icon type="plus"/>添加套餐</Button>
              <Divider type="vertical" />
              <Button
                type="primary"
                onClick={this.viewLabDetailClick.bind(this, {rowdata: dependentValues})} size='small'>查看详细 </Button>
              <Divider type="vertical" />
            </div>
          )
        },
      },*/
      /*{
        name: '创建时间',
        key: 'createTime',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        },
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
      <PageHeaderLayout>
        <div style={{marginTop: -20,background:'#fff'}}>
          {/*<Card bordered={false}></Card>*/}
          <Tabs defaultActiveKey={activeKey} onChange={this.onTabClick} type="card" style={{fontSize: 16,marginLeft:10}}>
              {/* 1.实验室 */}
              <TabPane tab="&emsp;添加实验室 &emsp;"  key="1">
                <div className="hidden">
                  {/*创建实验室列表 */}
                  <AddLaboratoryModal {...addLaboratoryModal} callback={this.addCallback} />
                  {/* 选医嘱*/}
                  <AddLabAndD5A5Modal {...addLabAndD5A5Modal} callback={this.addLabAndD5A5Callback} />
                  {/* 选套餐*/}
                  <AddLabAndRecipeModal {...addLabAndRecipeModal} callback={this.addLabAndRecipeCallback} />
                  {/*医嘱列表 和 套餐列表*/}
                  <ViewLabDetailModal {...viewLabDetailModal} callback={this.addLabDetailCallback}/>
                </div>
                <Card bordered={false}>
                  <div style={{marginTop:-30, marginBottom:-5,}}>{formEle}</div>

                  <ButtonContainer>
                    <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加实验室</Button>
                    <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary" icon="edit">修改</Button>
                    <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger" icon="close">删除</Button>
                  </ButtonContainer>

                  <Spin
                    spinning={spinning}
                    tip={tip}>
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
                      scroll={{x: 1150}}               //横向可滚动距离
                    />
                    {/*<Table
                      tableLoading={tableLoading}
                      size="small"
                      bordered
                      columns={_columns}
                      dataSource={dataSource}
                      pagination={_pagination}       //分页
                    />*/}
                  </Spin>
                </Card>
              </TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}

Laboratory.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
Laboratory.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

Laboratory = Form.create()(Laboratory);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(Laboratory);
