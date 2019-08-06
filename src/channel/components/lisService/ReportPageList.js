/**
 * Created by jpt on 2018/6/28 0028.
 */
import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import moment from 'moment'
import classNames from 'classnames';
import { Row, Col, Table, Card, Form, Input, Select, Icon,Spin, Button ,TimePicker , Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
//import style from './Report.less'
import { ButtonContainer,} from '../../../compoents2/';
import { ViewReportModal,} from './modules/'

import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchLocationByValues} from 'antd/../../src/compoents2/location/location.js'; //匹配省市区
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch, CONFIG}  from  '../../../services/';


/**
 * 报告单业务
 * 作者：jpt
 * */
class ReportPageList extends Component {
  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
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
      viewReportModal: {                                //报告单对话框。
        title: '',
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
    fetch('labReport/list', {
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
          tableLoading: true,
          tip: '获取数据中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          tableLoading: false,
          tip: ''
        })
      }
    })
  };



  //-------------------------- 查看报告对话框。-----------------------------------------------------
  // 2.根据labCode, 查询实验室名称。
  showLabName = (record, callback=()=>{}) => {
    fetch('labReportDetail/listByLabCode', {
      // method: 'post',
      // headers: {},
      data: {labCode: record.labCode},
      success: (res)=>{
        callback && callback(null, res);
      },
      error: (err)=>{
        callback && callback(err, null);
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
  // 1.根据id,查询报告单详细。
  showDetail = (record, callback=()=>{}) => { //labReportDetail/listByLabCode
    fetch('labReportDetail/list', {
      // method: 'post',
      // headers: {},
      data: {pageIndex: 1, pageSize: 1000,  reportId: record.id},
      success: (res)=>{
        callback && callback(null, res);
      },
      error: (err)=>{
        callback && callback(err, null);
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

  /**
   * 查看报告单明细
   * */
  viewDetailClick = ({data: selectedRows})=>{
    //----------------------------------------------
    this.showDetail(selectedRows, (err, res ={})=> {
      if(err){
        message.error('查询项目详细失败');
        return;
      }
      const {responseObject } = res
      const dataSource = responseObject.rows;
      //----------------------------------------------
      this.showLabName(selectedRows, (err, res ={})=> {
        if(err){
          message.error('查询实验室名称');
          return;
        }
        const labInformation = res.responseObject;
        console.log('labName', labInformation);
        //----------------------------------------------
        this.showReportModal({
          data: {
            ...selectedRows,
            dataSource: dataSource,
            labInformation,
          }
        });
      });
    });
  };

  showReportModal=({data})=>{
    this.setState(({viewReportModal})=>{
      return {
        viewReportModal: {
          ...viewReportModal,
          visible: true,
          data: data
        }
      }
    });
  }
  hiddenReportModal = ()=>{
    this.setState(({viewReportModal})=>{
      return {
        viewReportModal: {
          ...viewReportModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  showCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenReportModal();
      return;
    }
  };
  //-------------------------- end ------------------------------------------

  //-------------------------- 条件查询 -----------------------------------------------------
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getProductList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getProductList({pageIndex: 1, pageSize})
  };
  //------------------------ end -------------------------------------------------------------

  //------------------------ 收起or展开搜索栏。-------------------------------------------------------------
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
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('reportCode', {
            rules: false
          })(
            <Input  placeholder="报告单编号" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('deptName', {
            rules: false
          })(
            <Input  placeholder="科室名称" />
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
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('reportCode', {
            rules: false
          })(
            <Input  placeholder="报告单编号" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('deptName', {
            rules: false
          })(
            <Input  placeholder="科室名称" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('createUserName', {
            rules: false
          })(
            <Input  placeholder="创建人" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('applyDoctorName', {
            rules: false
          })(
            <Input  placeholder="送检医生" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('testDoctorName', {
            rules: false
          })(
            <Input  placeholder="检验员" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('auditDoctorName', {
            rules: false
          })(
            <Input  placeholder="审核员" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('sampleType', {
            rules: false
          })(
            <Input  placeholder="样本类型" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('sampleCode', {
            rules: false
          })(
            <Input  placeholder="样本编号" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('labCode', {
            rules: false
          })(
            <Input  placeholder="实验室编号" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('doctorAdviceName', {
            rules: false
          })(
            <Input  placeholder="医嘱名称" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('sourceOrgId', {
            rules: false
          })(
            <Input  placeholder="来源机构" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('state', {
            rules: false
          })(
            <Select placeholder="状态" style={{ width: 174 }}>
              <Select.Option value="0">未审核</Select.Option>
              <Select.Option value="1">通过</Select.Option>
              <Select.Option value="2">不通过</Select.Option>
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
  //------------------------ end ---------------------------------------------------------------

  render() {
    const { form } =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total},
      spinning,tip,tableLoading,selectedIds,selectedRows, viewReportModal, detailRows } = this.state;

    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//实验室类型模块---匹配字典表。
    lisType = searchTextByValues('lis_type');//lis类型模块---匹配字典表。

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
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 100,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '性别',
        dataIndex: 'sex',
        fixed: 'left',
        key: 'sex',
        width: 60,
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
      },

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
      },
      {
        title: '医嘱名称',
        dataIndex: 'doctorAdviceName',
        key: 'doctorAdviceName',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '样本类型',
        dataIndex: 'sampleType',
        key: 'sampleType',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          let state;
          if(value==0){
            state = "未审核";
          }else if(value==1){state = "通过";}
          else if (value==2){state = "不通过";}
          return (
            <span>{state}</span>
          )
        }
      },
      {
        title: '报告单号',
        dataIndex: 'reportCode',
        key: 'reportCode',
        width: 150,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '病历号 ',
        dataIndex: 'patientCode',
        key: 'patientCode',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '科室(部门)',
        dataIndex: 'deptName',
        key: 'deptName',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        key: 'createUserName',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '检验医生',
        dataIndex: 'testDoctorName',
        key: 'testDoctorName',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '审核医生',
        dataIndex: 'auditDoctorName',
        key: 'auditDoctorName',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '样本编号',
        dataIndex: 'sampleCode',
        key: 'sampleCode',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '实验室编号',
        dataIndex: 'labCode',
        key: 'labCode',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },

      {
        title: '操作',
        fixed: 'right',
        key: 'operation',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span onClick={this.viewDetailClick.bind(this, {data: record})}><a>查看详情</a></span>
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
        this.getProductList({pageIndex: current, pageSize})
      }
    };
    return (
      <PageHeaderLayout>
        <div style={{marginTop: -20,}}>
          <div className="hidden">
            <ViewReportModal {...viewReportModal} callback={this.showCallback}/>
          </div>

          <Card bordered={false}>
            <div style={{marginTop:-20, marginBottom:5}}>
              {this.renderForm()}
            </div>

            <Spin
              spinning={spinning}
              tip={tip}>
              <Table
                //size="small"
                style={{ marginBottom: 8 }}
                loading={tableLoading}
                bordered
                rowKey={(record, i)=>{return `${record.id}`}}
                //rowSelection={rowSelection}
                columns={_columns}
                rowClassName={(record) => {return record.editable ? styles.editable : ''; }}
                dataSource={dataSource}
                pagination={_pagination}       //分页
                height={400}
                scroll={{x: 1830}}
                //onChange={this.handleGridSort}  //分页、排序、筛选的触发该函数。
              />
            </Spin>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

ReportPageList = Form.create({})(ReportPageList);

export default ReportPageList
