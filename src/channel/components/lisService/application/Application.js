import React, { PureComponent, Component } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import moment from 'moment'
var createReactClass = require('create-react-class');
import { Row, Col, Table, Card, Form, Input, Select, Icon,Spin, Button ,TimePicker , Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import fetch from 'antd/../../src/services/request'
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import {AddApplicationSaveModal,} from '../modules/'
import style from './Application.less'

import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchLocationByValues} from 'antd/../../src/compoents2/location/location.js'; //匹配省市区
import { ButtonContainer,} from '../../../../compoents2/';

import classNames from 'classnames';


class Application extends Component {

  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      detailRows: [],
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      addApplicationSaveModal: {                            // 新建
        title: '查看详情',
        visible: false,
        data: {}
      },
      expandForm: false,                                //按条件查询框的: 收起/展开。
    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getProductList({pageIndex, pageSize});
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.array !== undefined){
      this.setState({
        array:  nextProps.array
      });
    }
  }

  onSelectChange = (selectedIds, selectedRows) => {
    this.setState({selectedIds,  selectedRows });
  }

  _getAllListQuery = (pageQuery = {})=>{
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      //if((values.startTime)!= null){
        //values.startTime = moment(values.startTime).unix()*1000;
     // }
      values.startTime = isNaN(values.startTime) ? null : moment(values.startTime).unix()*1000;
      values.endTime = isNaN(values.endTime) ? null : moment(values.endTime).unix()*1000;
      _f = { ...values};
    });
    // step1 获取所有查询参数
    return {
      ..._f,
      ...pageQuery
    }
  };

  getProductList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    fetch('labApplyBill/list', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage} = res;
        this.setState({
          listPage
        })
      },
      error: (err)=>{
        // step1.
        message.error(err.message||'分页列表接口报错');
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

  showCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd();
      return;
    }
  };

  hiddenAdd = ()=>{
    this.setState(({addApplicationSaveModal})=>{
      return {
        addApplicationSaveModal: {
          ...addApplicationSaveModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  showDetail = (record) => {
    const {listPage: {pageIndex, pageSize}} = this.state;
    fetch('labApplyBillDetail/list', {
      // method: 'post',
      // headers: {},
      data: {
        pageIndex : pageIndex,
        pageSize :pageSize,
        LabApplyBillId : record.id
      },
      success: (res)=>{
        this.setState(({addApplicationSaveModal})=>{
          return {
            addApplicationSaveModal: {
              ...addApplicationSaveModal,
              visible: true,
              data: res.responseObject,
            },
            detailRows:record,
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
    });
  }

  //------------------------ 条件查询 ----------------------------------
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getProductList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getProductList({pageIndex: 1, pageSize})
  };
  //------------------------ end --------------------------------------

  //------------------------ 收起or展开搜索栏。---------------------------------------------------------
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
    const inputHeight = {
      height:24,
      width:175
    };
    const formHeight = {
      height:30
    };
    return (
      <Form layout="inline">
        <Form.Item style={formHeight}>
          {getFieldDecorator('code', {
            rules: false
          })(
            <Input  placeholder="申请单编号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('outpatientCode', {
            rules: false
          })(
            <Input  placeholder="门诊号" style={inputHeight}/>
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
    const inputHeight = {
      height:24,
      width:175
    };
    const formHeight = {
      height:30
    };
    return (
      <Form layout="inline">
        <Form.Item style={formHeight}>
          {getFieldDecorator('code', {
            rules: false
          })(
            <Input  placeholder="申请单编号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('outpatientCode', {
            rules: false
          })(
            <Input  placeholder="门诊号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('clinicalDoctor', {
            rules: false
          })(
            <Input  placeholder="申请医生" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('testDoctor', {
            rules: false
          })(
            <Input  placeholder="检验医生" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('deptName', {
            rules: false
          })(
            <Input  placeholder="部门名称" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('labCode', {
            rules: false
          })(
            <Input  placeholder="实验室编号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('source', {
            rules: false
          })(
            <Input  placeholder="申请单来源" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('startTime', {
            rules: false
          })(
            <DatePicker placeholder="请选择起始时间" size="small" style={{width:175}}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('endTime', {
            rules: false
          })(
            <DatePicker placeholder="请选择截止时间" size="small" style={{width:175}}/>
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
  //------------------------ end ---------------------------------------------------------------

  render() {
    const { form } =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total},
      spinning,tip,tableLoading,selectedIds,selectedRows,addApplicationSaveModal, detailRows } = this.state;

    const dateFormat = 'YYYY/MM/DD';
    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//实验室类型模块---匹配字典表。
    lisType = searchTextByValues('lis_type');//lis类型模块---匹配字典表。

    const inputHeight = {
      height:24,
      width:175
    };
    const formHeight = {
      height:30
    };
    const buttonHeight = {
      height:24,
      marginTop:2
    };

    const rowSelection = {
      selectedIds,  //指定选中项的key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };
    const _columns = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 50,
        fixed: 'left',
        render: (value, record, i)=>{
          return (pageIndex - 1) * pageSize + i +1
        }
      },{
        title: '姓名',
        dataIndex: 'patientName',
        key: 'patientName',
        fixed: 'left',
        width: 100,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },{
        title: '性别',
        dataIndex: 'sex',
        fixed: 'left',
        key: 'sex',
        width: 100,
        render: (value, record, i)=>{
          let sex2;
          if(value === 1){
            sex2 = "男";
          }else if(value === 2){
            sex2 = "女";
          }
          return (
            <span>{sex2 }</span>
          )
        },
        //sorter: true,
      },{
        title: '申请单编号',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '门诊号 ',
        dataIndex: 'outpatientCode',
        key: 'outpatientCode',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '申请医生',
        dataIndex: 'clinicalDoctor',
        key: 'clinicalDoctor',
        width: 150,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '检验者',
        dataIndex: 'testDoctor',
        key: 'testDoctor',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '实验室编号',
        dataIndex: 'labCode',
        key: 'labCode',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '来源his厂家',
        dataIndex: 'source',
        key: 'source',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '申请时间',
        dataIndex: 'applyTime',
        key: 'applyTime',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        }
      },{
        title: '操作',
        fixed: 'right',
        key: 'action',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <a onClick={this.showDetail.bind(this,record)} >查看详情</a>
          )
        }
      },
    ];
    const formEle =( <Form layout='inline'>
        <Form.Item style={formHeight}>
          {getFieldDecorator('code', {
            rules: false
          })(
            <Input  placeholder="申请单编号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('outpatientCode', {
            rules: false
          })(
            <Input  placeholder="门诊号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('clinicalDoctor', {
            rules: false
          })(
            <Input  placeholder="申请医生" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('testDoctor', {
            rules: false
          })(
            <Input  placeholder="检验医生" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('deptName', {
            rules: false
          })(
            <Input  placeholder="部门名称" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('labCode', {
            rules: false
          })(
            <Input  placeholder="实验室编号" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('source', {
            rules: false
          })(
            <Input  placeholder="申请单来源" style={inputHeight}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('startTime', {
            rules: false
          })(
            <DatePicker placeholder="请选择起始时间" size="small" style={{width:175}}/>
          )}
        </Form.Item>
        <Form.Item style={formHeight}>
          {getFieldDecorator('endTime', {
            rules: false
          })(
            <DatePicker placeholder="请选择截止时间" size="small" style={{width:175}}/>
          )}
        </Form.Item><br/>
        <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
          <Button
            onClick={this.queryClick}
            type="primary"
            icon="search" style={buttonHeight}>查询</Button>
          <Button
            onClick={this.resetClick}
            icon="reload" style={buttonHeight}>重置</Button>
        </ButtonContainer>
      </Form>
    );
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
        this.getProductList({pageIndex: current, pageSize})
      }
    };

    return (
      <PageHeaderLayout>
        <div style={{marginTop: -20,}}>
          <div className="hidden">
            <AddApplicationSaveModal {...addApplicationSaveModal} {...detailRows} callback={this.showCallback}/>
          </div>

          <Card bordered={false}>
            <div style={{marginTop:-20, marginBottom:-5}}>{this.renderForm()}</div>
            <Spin
              spinning={spinning}
              tip={tip}>
              {/* 1.查询栏 */}
              {/*<ButtonContainer>
                <Button type="primary"><Icon type="plus" />新增产品</Button>
                <Button type="primary"><Icon type="edit" />修改</Button>
                <Button type="danger"><Icon type="close" />删除</Button>
              </ButtonContainer>*/}
              <br/>
              <div>
                <Table
                  loading={tableLoading}
                  size="small"
                  bordered
                  rowKey={(record, i)=>{return `${record.id}`}}
                  //rowSelection={rowSelection}
                  columns={_columns}
                  rowClassName={(record) => {return record.editable ? styles.editable : ''; }}
                  dataSource={dataSource}
                  pagination={_pagination}       //分页
                  height={400}
                  scroll={{x: 1400}}
                  //onChange={this.handleGridSort}  //分页、排序、筛选的触发该函数。
                />
              </div>
            </Spin>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

Application = Form.create({})(Application);

export default Application
