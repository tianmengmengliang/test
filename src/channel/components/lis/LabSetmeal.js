/**
 * Created by jpt on 2018/6/20 0020.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table,Tabs, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
//import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import { AddDeviceTypleModal, AddLabSetmealModal, ViewRecipeDetail } from './modules/'
import LabProject from './LabProject';
import Laboratory from './Laboratory';
import {searchTextByValues }      from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchSampleTypeByValues} from 'antd/../../src/compoents2/location/SampleTypeList.js'; //匹配样本类型
import moment from 'moment'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch }from '../../../services/'
//---------------------------------------------------------------------------------------------------------------------


/**
 * 套餐库
 * */
class LabSetmeal extends Component {
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
      addLabSetmealModal: {                            // 新建
        title: '添加套餐',
        visible: false,
        data: {}
      },
      viewRecipeDetail: {
        title: '',
        visible: false,
        data: {}
      },
      activeKey: '1',                                    // 激活的tabPane的key，
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
    fetch('labRecipe/list', {
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
        callback && callback(null, res)
      },
      error: (err)=>{
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
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          title: '获取数据中...'
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
    console.log('1.handleGridRowsUpdated',arguments)
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
    /* 进行复选。
    this.setState( {
      selectedIds: this.state.selectedIds.concat( rows.map(r => r.row[this.props.rowKey])),
    });
    this.setState({
      selectedRows: this.state.selectedRows.concat( rows.map(r => r.row)),
    });*/
    //进行单选
    this.setState({
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
      selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 ), //
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
    if(type === 'add') {
       this.showAdd({data:{ } });
    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if(hasSelectedOnlyOneIdx){
            this.getAdviceProject({recipeId: selectedRows[0][this.props.rowKey] }, (err, res ={})=> {
              if(err){
                message.warn(`查询套餐的医嘱失败`);
              }
              //console.log("--查询:--",res.responseObject );
              this.showAdd({
                data: {...selectedRows[0],
                  selectedRows: res.responseObject === null? [] : res.responseObject,
                },
              })
            });
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addLabSetmealModal})=>{
      return {
        addLabSetmealModal: {
          ...addLabSetmealModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addLabSetmealModal})=>{
      return {
        addLabSetmealModal: {
          ...addLabSetmealModal,
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

  //1.根据套餐id,查询选中医嘱接口
  getAdviceProject = (selectId={}, callback=()=>{})=>{ //
    fetch('doctorAdvice/listByRecipeId', {
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


  //-------------------------------- end 新增、修改--------------------------------


  //--------------------------------- start 删除订单--------------------------------
  /*
   * @interface 删除一条通知记录
   * */
  delOrderClick = ({data: selectedRows= []})=>{
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
        content: '你确定要该记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        //id: selectedRows[0][this.props.rowKey]
        onOk: ()=> {
          /*let selectedRows2 = [];
          for(let i=0; i<selectedRows.length; i++){
            selectedRows2.push( selectedRows[i][this.props.rowKey]);
          }*/
          this.delOrder({id: selectedRows[0]['id']}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error('删除记录失败');
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
  delOrder = (selectedId ={}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('labRecipe/remove', {
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
  //---------------------------- end 删除订单 ----------------------------------


  //----------------------- 查看详细Model ------------------------------------
  viewDetailClick = ({rowdata: selectedRows})=>{
     this.showViewDetailModal({data: {...selectedRows}});
  };
  showViewDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewRecipeDetail})=>{
      return {
        viewRecipeDetail: {
          ...viewRecipeDetail,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewRecipeDetail})=>{
      return {
        viewRecipeDetail: {
          ...viewRecipeDetail,
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
      selectedIds, selectedRows, tip, addDeviceTypleModal, addLabSetmealModal, viewRecipeDetail,
      activeKey, doctorDviceType, sampleType,} = this.state;
    //console.log('doctorDviceType',doctorDviceType);

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
      <Form.Item label="助记码">
        {getFieldDecorator('shortName', {
          rules: false
        })(
          <Input  placeholder="不限" />
        )}
      </Form.Item>
      <Form.Item label="中文名称">
        {getFieldDecorator('nameCn', {
          rules: false
        })(
          <Input  placeholder="不限" />
        )}
      </Form.Item>
      <Form.Item label="备注">
        {getFieldDecorator('remark', {
          rules: false
        })(
          <Input  placeholder="不限"/>
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
        width: 100,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <span onClick={this.viewDetailClick.bind(this, {rowdata: dependentValues})}><a>查看套餐详细</a></span>
              {/*<Divider type="vertical" />
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
        name: '中文名称',
        key: 'nameCn',
        width: 250,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '助记码',
        key: 'shortName',
        width: 200,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '临床意义',
        key: 'remark',
        width: 500,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
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
        this.getDevicesTypleList({pageIndex: current, pageSize})
      }
    };

    return (
      <PageHeaderLayout>
        <div style={{marginTop:-20,}}>
          <div className="hidden">
            <AddLabSetmealModal  {...addLabSetmealModal} callback={this.addCallback}/>
            <ViewRecipeDetail {...viewRecipeDetail} callback={this.viewDetailCallback}/>
          </div>
          <Card bordered={false}>
            <div style={{marginTop:-10, marginBottom:-5,}}>{formEle} </div>
            <Spin
              spinning={spinning}
              tip={tip}>
              <ButtonContainer>
                <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加套餐</Button>
                <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary" icon="edit">修改</Button>
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
                minHeight={400}
                rowScrollTimeout={0}
                onGridSort={this.handleGridSort}
                pagination={_pagination}
              />
            </Spin>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

LabSetmeal.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
LabSetmeal.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

LabSetmeal = Form.create()(LabSetmeal);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(LabSetmeal);
