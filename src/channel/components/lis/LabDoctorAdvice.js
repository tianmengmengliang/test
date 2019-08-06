/**
 * Created by jpt on 2018/5/10 0010.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table,Tabs, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
//import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import {LisLoginModal, AddDeviceTypleModal, AddDoctorAdvice, ViewDoctorAdviceDetail } from './modules/'
import LabProject from './LabProject';
import Laboratory from './Laboratory';
import {searchTextByValues }      from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchSampleTypeByValues} from 'antd/../../src/compoents2/location/SampleTypeList.js'; //匹配样本类型
import moment from 'moment'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch, CONFIG}  from '../../../services/';


/**
 *  医嘱库模块
 *  作者: jpt
 * */
class LabDoctorAdvice extends Component {
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
      addDoctorAdvice: {                            // 新建
        title: '添加医嘱',
        visible: false,
        data: {}
      },
      viewDoctorAdviceDetail: {
        title: '',
        visible: false,
        data: {}
      },
      activeKey: '1',                                    // 激活的tabPane的key，
      expandForm: false,                                //按条件查询框的: 收起/展开。

      doctorDviceType: [],                              //医嘱类型
      sampleType: [],                                   //样本类型
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
      selectedRows: [],
    })
  };

  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getDevicesTypleList({pageIndex, pageSize});
    //医嘱类型
    this.getDictionaryList({name: 'doctor_advice_type'});
    //样本类型。
    this.getSampleTypeList({});
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
   * @interface 获取医嘱分页列表
   * */
  getDevicesTypleList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    //console.log("--请求参数:", _q);
    // step2. 请求列表数据
    fetch('doctorAdvice/list', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        //console.log("--分页列表响应数据:", listPage);
        this.setState({
          listPage
        });
      },
      error: (err)=>{
        // step1.
        message.error(err.message||'医嘱列表响应数据失败！');
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


  //---------------- 字典表匹配请求接口 --------------------
  getDictionaryList = (selectedId={}, callback = ()=>{})=>{
    fetch('dic/list', {
      // method: 'post',
      // headers: {},
      data: selectedId,
      success: (res)=>{
        const {responseObject } = res;
        this.setState({
          doctorDviceType: responseObject,
        });
        callback && callback(null, res)
      },
      error: (err)=>{
        message.error(err.message+',医嘱列表请求失败！');
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
         spinning: true,
         title: '匹配中...'
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


  //----------------  样本列表 -----------------------
  getSampleTypeList = (selectedId={}, callback = ()=>{})=>{
    fetch('sampleType/list', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        const {responseObject } = res;
        this.setState({
          sampleType: responseObject,
        });
        callback && callback(null, res)
      },
      error: (err)=>{
        message.error(err.message+',样本列表请求失败！');
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          title: '匹配中,稍等...'
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



  //----------------- start 选中行 ------------------------------------------------
  /*
   * @interface Grid  1.行更新
   * */
  handleGridRowsUpdated = ({fromRow, toRow, updated })=> {
    //console.log('1.handleGridRowsUpdated',arguments)
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
    //进行复选。
    this.setState( {
      selectedIds: this.state.selectedIds.concat( rows.map(r => r.row[this.props.rowKey])),
    });
    this.setState({
      selectedRows: this.state.selectedRows.concat( rows.map(r => r.row)),
    });
    //进行单选
     /* this.setState({
      selectedIds: rows.map(r => r.row[this.props.rowKey]),
    });
    this.setState({
      selectedRows: rows.map(r => r.row),
    });*/

  };

  /*
   * @interface 3.取消选中行接口
   * @param {Array} 取消选中的行
   * */
  onRowsDeselected = (rows /*取消选择的行*/) =>{
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({
      selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 ), //
    });
    this.setState({
      selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )
    });
  };


  /**
   * @interface 4.行选中接口
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
  //------------------ end --------------------------------


  //----------------------------- start 查询ProjectIds接口-------------------------------
  //1.查询项目ProjectIds接口
  getProjectIds = ( callback=()=>{})=>{ //
    const _q = {pageIndex:1, pageSize:1000,}
    fetch('labProject/list', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        //console.log("--查询:--",res);
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

  //------------------------------- start 新增、修改  -----------------
  add = ({type,  data: selectedRows=[]})=>{
    //------- 字典表、样本类型表 -------------------------------
     const {doctorDviceType, sampleType } = this.state;
    if(type === 'add') {
      //------- 仪器类型表 --------------------------------------
      this.getDevicesList({}, (err, res ={})=> {
        if (err) {
          message.error('仪器类型查询失败');
          return;
        }
        this.showAdd({
          data: {
            doctorDviceType: doctorDviceType,
             sampleType: sampleType,

            devicesType: res.responseObject,
          }
        });
      });
      //-----------------------------------------------------------
    }
    if(type === 'edit') {
      //const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      //if(hasSelectedOnlyOneIdx){
      /**
       * 修改时selectedRows为 {}对象。
       * */
      if(true){
            let _devicesType = [];
            //------- 3.仪器类型表 ----------------------------------
            this.getDevicesList({},(err, res ={})=> {
              if (err) {
                message.error('仪器类型查询失败');
                return;
              }
              _devicesType = res.responseObject;
              //------------------------------------------------
              //------------------------------------------------
              this.getAdviceProject({id: selectedRows[this.props.rowKey]}, (err, res = {})=> {
                if (err) {
                  message.error('查询已选项目失败');
                  return;
                }
                this.showAdd({
                  data: {
                    ...selectedRows,
                    doctorDviceType: doctorDviceType,
                    sampleType: sampleType,
                    devicesType: _devicesType,
                    selectedRows: res.responseObject,
                  },
                })
              });

        })
        //----------------------------------------------------------------------------------------------------
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addDoctorAdvice})=>{
      return {
        addDoctorAdvice: {
          ...addDoctorAdvice,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addDoctorAdvice})=>{
      return {
        addDoctorAdvice: {
          ...addDoctorAdvice,
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

  //------------ 1.根据医嘱id, 查询医嘱已选中项目接口 ---
  getAdviceProject = (selectId={}, callback = ()=>{})=>{
    fetch('labDoctorAdviceDetail/list', {
      // method: 'post',
      // headers: {},
      data: selectId,
      success: (res)=>{
        //console.log("--查询:--",res);
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
  //------------ 2.仪器类型列表请求接口 ----------------
  getDevicesList = (selectedId={}, callback = ()=>{})=>{
    fetch('deviceType/list', {
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
          title: '请求中...'
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


  //-------------------------------- end 新增、修改--------------------------------


 //--------------------------------- start 删除订单--------------------------------
  /*
   * @interface 删除一条通知记录
   * */
  delOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    //const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (true) {
      // s1-case1. 只选中一条订单并且订单的状态为未提交status 0
      //let isStatus0 = selectedRows[0]['state'] === 0;
      //if (isStatus0) {
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要该记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          let selectedId = [];
          for(let i=0; i<selectedRows.length; i++){
            selectedId.push(selectedRows[i][this.props.rowKey]);
          }
          this.delOrder({ids: selectedId}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error('删除记录失败');
            }else {
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
  delOrder = (selectedId={}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('doctorAdvice/remove', {
      // method: 'post',
      // headers: {},
      data: {...selectedId, deleteFlag: 1},
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
 //---------------------------- end 删除订单 ----------------------------------


  //----------------------- start 查看详细 Model -- 惺惺惜惺惺----------------------------------
  viewDetailClick = ({rowdata: selectedRows})=>{
    this.showViewDetailModal({data: {...selectedRows}});
  };
  showViewDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewDoctorAdviceDetail})=>{
      return {
        viewDoctorAdviceDetail: {
          ...viewDoctorAdviceDetail,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewDoctorAdviceDetail})=>{
      return {
        viewDoctorAdviceDetail: {
          ...viewDoctorAdviceDetail,
          visible: false,
          data: {}
        }
      }
    })
  };
  viewDetailCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenViewDetailModal();
      return;
    }
  };
  //----------------------- end 查看详细Model ------------------------------------

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

  //------------------------ 收起or展开搜索栏。----------------------------------------------
  /*
   * @interface 点击条件查询 Button的回调
   * @param {string} 点击的expandForm的值bool取反。
   * */
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  /*
   * @interface 点击tabPane的回调
   * */
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return ( <Form layout="inline">
        <Form.Item //label="医嘱中文"
        >
          {getFieldDecorator('nameCn', {
            rules: false
          })(
            <Input  placeholder="医嘱中文" />
          )}
        </Form.Item>
        <Form.Item //label="医嘱英文"
        >
          {getFieldDecorator('nameEn', {
            rules: false
          })(
            <Input  placeholder="医嘱英文" />
          )}
        </Form.Item>

        <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
          <Button onClick={this.queryClick} type="primary" icon="search">
            查询
          </Button>
          <Button onClick={this.resetClick} icon="reload">
            重置
          </Button>
          <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
            展开 <Icon type="down" />
          </a>
        </ButtonContainer>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const { doctorDviceType, sampleType } = this.state;

    return ( <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('nameCn', {
            rules: false
          })(
            <Input  placeholder="医嘱中文" />
          )}
        </Form.Item>
        <Form.Item //label="医嘱英文"
        >
          {getFieldDecorator('nameEn', {
            rules: false
          })(
            <Input placeholder="医嘱英文" />
          )}
        </Form.Item>

        <Form.Item>
          {getFieldDecorator('type', {
            rules: false
          })(
            <Select
              //size="large"
              style={{width: 150, marginRight: '2%' }}
              placeholder={`请选择医嘱类型`}
              allowClear={true}
              multiple={false}
              combobox={false}
              tags={false}
              showSearch={false}
              filterOption={false}
              optionFilterProp={`children`}
              labelInValue={false}
              tokenSeparators={null}
            >
              {doctorDviceType.map((item)=>{
                return( <Select.Option value={item.value} key={item.id}>{item.text}</Select.Option> )
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('sampleTypeId', {
            rules: false
          })(
            <Select
              //size="large"
              style={{width: 150, marginRight: '2%' }}
              placeholder={`请选择样本类型`}
              allowClear={true}
              multiple={false}
              combobox={false}
              tags={false}
              showSearch={false}
              filterOption={false}
              optionFilterProp={`children`}
              labelInValue={false}
              tokenSeparators={null}
            >
              {sampleType.map((item)=>{
                return( <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option> )
              })}
            </Select>
          )}
        </Form.Item>

        <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
          <Button onClick={this.queryClick} type="primary" icon="search">
            查询
          </Button>
          <Button onClick={this.resetClick} icon="reload">
            重置
          </Button>
          <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
            收起 <Icon type="up" />
          </a>
        </ButtonContainer>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }
  //---------------------------------------------------------------------------------------

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
      selectedIds, selectedRows, tip, addDeviceTypleModal, addDoctorAdvice, lisLoginModal, viewDoctorAdviceDetail,
      activeKey, doctorDviceType, sampleType,} = this.state;


    const _columns = [
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
        title: '名称',
        dataIndex: 'value',
        key: 'value',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '内容',
        dataIndex: 'text',
        key: 'text',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '设备描述',
        dataIndex: 'descInfo',
        key: 'descInfo',
        width: 250,
        render: (text, record) => {
          {/**/}
          return (
            <span>{text ? text : undefined}</span>
          )
        },
      },
      {
        title: '所属公司',
        dataIndex: 'vendor',
        key: 'vendor',
        width: 250,
        render: (text, record) => {
          return(
            <span>{text}</span>
          )
        },
      },
      {
        title: '注册编号',
        dataIndex: 'registNo',
        key: 'registNo',
        width: 200,
        render: (text, record) => {
          return(
            <span>{text ? text : undefined}</span>
          )
        },
      },

      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        },
      },
      {
        title: '修改时间',
        dataIndex: 'modifyTime',
        key: 'modifyTime',
        width: 150,
        render: (text, record) => {
          return(
            <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        },
      },
    ];
    const formEle =( <Form layout="inline">
      <Form.Item //label="医嘱中文"
      >
        {getFieldDecorator('nameCn', {
          rules: false
        })(
          <Input  placeholder="医嘱中文" />
        )}
      </Form.Item>
      <Form.Item //label="医嘱英文"
      >
        {getFieldDecorator('nameEn', {
          rules: false
        })(
          <Input  placeholder="医嘱英文" />
        )}
      </Form.Item>
      <Form.Item //label="样本类型"
      >
        {getFieldDecorator('sampleTypeId', {
          rules: false
        })(
          <Input placeholder="样本类型"/>
        )}
      </Form.Item>
      <Form.Item //label="医嘱类型"
      >
        {getFieldDecorator('type', {
          rules: false
        })(
          <Input  placeholder="医嘱类型"/>
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

    const columns = [
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
      {
        name: '操作',
        key: 'operation',
        width: 150,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <span onClick={this.add.bind(this, {type:'edit', data: dependentValues})}><a>修改</a></span>
              <Divider type="vertical" />
              <span onClick={this.viewDetailClick.bind(this, {rowdata: dependentValues})}><a>查看项目详细</a></span>
              {/*
               <ButtonContainer>
               <Button
               type="primary"
               onClick={this.viewPOCTBoxClick.bind(this, {dependentValues})}> 查看模块</Button>
               <Button
               type="primary"
               onClick={this.addPOCTBoxModuleClick.bind(this, {dependentValues})}>添加模块</Button>
               <Button
               type="danger"
               onClick={this.delPOCTBoxModuleClick.bind(this, {dependentValues})}>删除模块</Button>
               <Button
               type="primary"
               onClick={this.updataPOCTBoxModuleClick.bind(this, {dependentValues})}>修改模块</Button>
               </ButtonContainer> */}
            </div>
          )
        },
      },
      {
        name: '医嘱中文',
        key: 'nameCn',
        width: 250,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '医嘱英文',
        key: 'nameEn',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '临床意义',
        key: 'remark',
        width: 200,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '医嘱类型',
        key: 'type',
        width: 90,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          let _arr =[], text='';
          _arr = searchTextByValues('doctor_advice_type'); //医嘱类型模块名称---匹配字典表。
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
          //
        },
      },
      {
        name: '样本类型',
        key: 'sampleTypeId',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          let l = searchSampleTypeByValues(value);
          return (
            <span>{l}</span>
          )
        },
      },
      {
        name: '样本管',
        key: 'tube',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '助记码',
        key: 'shortName',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '地方标志',
        key: 'localFlag',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          switch(value){
            case 0 :  return ( <span style={{color:'#00EA00'}}>{'本地'}</span> );  break;
            case 1 :  return ( <span style={{color:'#ff0000'}}>{'外送'}</span> );  break;
            default:  return ( <span style={{color:'#F9A704'}}>{'情况未知'}</span> );
          }
        },
      },
      {
        name: '价格',
        key: 'price',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value !== null ? value+ "￥":  ""}</span>
          )
        },
      },
      {
        name: '状态',
        key: 'deleteFlag',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value === 0 ? "正常": "已删除"}</span>
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
        this.getDevicesTypleList({pageIndex: current, pageSize})
      }
    };

    return (
      <PageHeaderLayout>
      <div style={{marginTop: -20,}}>
        <div className="hidden">
          <LisLoginModal {...lisLoginModal}  callback={this.LoginCallback}/>
          <AddDoctorAdvice  {...addDoctorAdvice} callback={this.addCallback}/>
          <ViewDoctorAdviceDetail {...viewDoctorAdviceDetail} callback={this.viewDetailCallback}/>
        </div>

        <Card bordered={false}>
          <div style={{marginTop:-10, marginBottom:-5,}}>{this.renderForm()}</div>
          <Spin
            spinning={spinning}
            tip={tip}>
            <ButtonContainer>
              <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加医嘱</Button>
              {/*<Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary" icon="edit">修改</Button>*/}
              <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger" icon="close">删除</Button>
            </ButtonContainer>
            <GridTable
              tableLoading={tableLoading}
              dataSource={dataSource}
              columns={columns}
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
              //minWidth={1300}
              minHeight={420}  //表的列比较多时? 420 : 400;
              rowScrollTimeout={0}
              onGridSort={this.handleGridSort}
              pagination={_pagination}
              scroll={{x: 1050}}               //横向可滚动距离
            />
          </Spin>
        </Card>
      </div>
      </PageHeaderLayout>
    );
  }
}

LabDoctorAdvice.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
LabDoctorAdvice.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};
LabDoctorAdvice = Form.create()(LabDoctorAdvice);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(LabDoctorAdvice);
