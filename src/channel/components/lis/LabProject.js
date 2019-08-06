/**
 * Created by jpt on 2018/5/12 0012.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import moment from 'moment'
import {Row, Col, Form, Card, Table,Tabs, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
//import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import { AddLabProjectModal, ViewLabProjectModal, } from './modules/'

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch }from '../../../services/'

/**
 *  项目列表
 * */
class LabProject extends Component {
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
      addLabProjectModal: {                            // 新建
        title: '',
        visible: false,
        data: {}
      },
      viewLabProjectModal: {                            //查看项目详细
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
    this.getProjectIdsList({pageIndex, pageSize});
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

  /**
   *  查询 ProjectIds分页列表
   * */
  getProjectIdsList = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query); //q是分页参数
    // step1. 请求列表数据
    fetch('labProject/list',{
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
        message.error(err.message ||'分页列表接口报错');
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
  //--------------------------------end列表-----------------------------

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

  //---------------- 1.仪器类型列表请求接口 --------------------
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


  //----------------- start 选中行------------------------------------------------
  /*
   * @interface Grid  1.行更新
   * */
  handleGridRowsUpdated = ({fromRow, toRow, updated })=> {
    //console.log('handleGridRowsUpdated',arguments)
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
    //console.log('取消选中行接口', rows);
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

  //-----------------------------start 查询ProjectIds接口-------------------------------
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


  //一、根据id 查寻详情接口
  getLabOptionDetails = ({selectId}, callback)=>{
    console.log('selectId',selectId)
    fetch('labProjectDetail/list', {
      // method: 'post',
      // headers: {},
      data: {projectId: selectId},
      success: (res)=>{
        //console.log("----ciq.list:----",res);
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

  //================= 添加项目对话框 ======================================
  add = ({type,  data: selectedRows = []})=>{
    if(type === 'add') {
      //---------- 1.仪器类型表 ----------------------------------
      let _devicesType =[];
      this.getDevicesList({}, (err, res ={})=> {
        if (err) {
          message.error('仪器类型查询失败');
          return;
        }
        _devicesType = res.responseObject;
        //-----------------------------------------------------------
        this.showAdd({data: {devicesType: _devicesType,}});
      });
    }
    if(type === 'edit') {
      //const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      //if (hasSelectedOnlyOneIdx) {
      /**
       * 修改时selectedRows为 {}对象。
       * */
      if(true){
        //-------------1.查询----------------------------------------------------
        let _samples=[], _devicesType =[];
        this.getLabOptionDetails({selectId: selectedRows[this.props.rowKey] }, (err, res={})=> { //根据id查看详情
          if (err) {//case1. 请求通知明细失败
            message.error('请求明细失败');
            return
          }
          _samples = res.responseObject
          //---------------------------------------
          //---------- 2.仪器类型表 ----------------------------------
          this.getDevicesList({}, (err, res ={})=> {
            if (err) {
              message.error('仪器类型查询失败');
              return;
            }
            _devicesType = res.responseObject;
            //-----------------------------------------------------------
            this.showAdd({
              data: {
                ...selectedRows,
                samples: _samples,
                devicesType: _devicesType,}
            })
          });
        });
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addLabProjectModal})=>{
      return {
        addLabProjectModal: {
          ...addLabProjectModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addLabProjectModal})=>{
      return {
        addLabProjectModal: {
          ...addLabProjectModal,
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
      this.getProjectIdsList({pageIndex, pageSize});
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
              message.error('删除记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getProjectIdsList({pageIndex, pageSize})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  delOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('labProject/remove', {
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
//-----------------------------------------------end 删除订单 ---------------------------

  //--------------------------------------------start 查看详细 -------------------------

  /**
   * 查看详细
   * */
  viewDetailClick = ({rowdata: selectedRows})=>{
    //step1. 查询详细。
    this.getLabOptionDetails({selectId: selectedRows.id }, (err, res={})=> { //根据id, 查看详情
      if (err){
        message.error('请求明细失败');
        return
      }
      const {responseObject}= res;

      //step2. 查询仪器类型。
      this.getDevicesList({}, (err, res ={})=> {
        if (err) {
          message.error('仪器类型查询失败');
          return;
        }
        const _devicesType = res.responseObject;
        //-----------------------------------------------------------
        this.showViewDetailModal({data: {...selectedRows, samples: responseObject, devicesType: _devicesType,}});
      })
    });
  };
  showViewDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewLabProjectModal})=>{
      return {
        viewLabProjectModal: {
          ...viewLabProjectModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewLabProjectModal})=>{
      return {
        viewLabProjectModal: {
          ...viewLabProjectModal,
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


  //-------------------------------------- 条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getCheckNotificationList({pageIndex: 1, pageSize})
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
    const formItemLayout = {
      labelCol: { span:6 },
      wrapperCol: { span: 18 },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
            <Form.Item label="中文名"
              {...formItemLayout}
            >
              {getFieldDecorator('nameCn', {
                rules: false
              })(
                <Input placeholder="请输入"/>
              )}
            </Form.Item>
            <Form.Item label="英文名"
              {...formItemLayout}
            >
              {getFieldDecorator('nameEn', {
                rules: false
              })(
                <Input placeholder="请输入"/>
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
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const formItemLayout2 = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
            <Form.Item label="中文名"
              {...formItemLayout}
            >
              {getFieldDecorator('nameCn', {
                rules: false
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>
            <Form.Item label="英文名"
              {...formItemLayout}
            >
              {getFieldDecorator('nameEn', {
                rules: false
              })(
                <Input placeholder="请输入" />
              )}
            </Form.Item>

            <Form.Item label="临床应用"
              {...formItemLayout2}
            >
              {getFieldDecorator('remark', {
                rules: false
              })(
                <Input placeholder="请输入" />
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

  render() {
    const { form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, addLabProjectModal, viewLabProjectModal,} = this.state;
    //console.log('rows',rows);

    const _columns = [
      {
        key: 'sn',
        name: '序号',
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
        locked: true,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <span onClick={this.add.bind(this, {type:'edit', data: dependentValues})}><a>修改</a></span>
              <Divider type="vertical" />
              <span onClick={this.viewDetailClick.bind(this, {rowdata: dependentValues})}><a>查看详细</a></span>
            </div>
          )
        },
      },
      {
        key: 'nameCn',
        name: '中文名称',
        width: 250,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'nameEn',
        name: '英文名称',
        width: 100,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'remark',
        name: '临床应用',
        width: 500,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      /*{
        key: 'medicareCode',
        name: '医保编号',
        width: 100,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          return (
            <span>{value}</span>
          )
        }
        /!* events: {
         onDoubleClick: function () {
         console.log('The user double clicked on title column');
         }
         }*!/
      },
      {
        key: 'shortName',
        name: '简称',
        width: 80,
        // locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'unit',
        name: '用量单位',
        width: 80,
        // locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'deleteFlag',
        name: '删除标记',
        width: 80,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value == 0? "正常":"已删除"}</span>
          )
        }
      },
      */
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
        this.getProjectIdsList({pageIndex: current, pageSize})
      }
    };

    return (
      <PageHeaderLayout>
        <div style={{marginTop: -20, }}>
            <div className="hidden">
              <AddLabProjectModal {...addLabProjectModal} callback={this.addCallback}/>
              <ViewLabProjectModal {...viewLabProjectModal} callback={this.viewDetailCallback}/>
            </div>
            <Card bordered={false}>
              <div style={{marginTop:-10, marginBottom:-5,}}>{this.renderForm()} </div>
              <Spin
                spinning={spinning}
                tip={tip}>
                <ButtonContainer>
                  <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加项目</Button>
                  {/*<Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary" icon="edit">修改项目</Button>*/}
                  <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger" icon="close">删除</Button>
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
                  minHeight={400}
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

LabProject.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
LabProject.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

LabProject = Form.create()(LabProject);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(LabProject);
