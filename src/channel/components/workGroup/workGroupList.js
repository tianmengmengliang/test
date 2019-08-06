/**
 * Created by jpt on 2018/5/17 0017.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table,Tabs, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
//import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import {AddDoctorAdvice,ViewDetailModal } from './modules/'
import moment from 'moment'
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch }from '../../../services/'


class workGroupList extends Component {
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
        title: '',
        visible: false,
        data: {}
      },
      viewDetailModal:{                            //查看
        title: '工作组详细',
        visible: false,
        data: {}
      },
      activeKey: '1',                              // 激活的tabPane的key，
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
    fetch('workGroup/list',{
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

  //----------------- start 选中行 ---------------------------------------------
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


  getLabOptionDetails = ( {selectId}, callback)=>{   //一、根据id, 查寻详情接口
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

  //==========================================================
  add = ({type,  data: selectedRows = []})=>{
    if(type === 'add') {
      this.showAdd({data:{} });
    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
        //-----------------------------------------------------------------
        this.getLabOptionDetails({selectId: selectedRows[0].id }, (err, res={})=> { //根据id, 查看详情
          if (err) {//case1. 请求通知明细失败
            message.error(err.message ||'请求明细失败');
            return
          }
          const {responseObject}= res
          //----------------------------
          //console.log('responseObject',responseObject);
          //console.log('selectedRows[0]',selectedRows[0]);
          this.showAdd({data: {...selectedRows[0],samples: responseObject}

          })
        })

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
//-----------------------------------------------end 删除订单 --------------------------------------

  //-----------------------------------------------------------
  //查看详细
  viewDetailClick = ({rowdata: selectedRows})=>{
    this.showViewDetailModal({data: {...selectedRows, }});
  };
  showViewDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewDetailModal})=>{
      return {
        viewDetailModal: {
          ...viewDetailModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewDetailModal})=>{
      return {
        viewDetailModal: {
          ...viewDetailModal,
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
      selectedIds, selectedRows, tip, addDoctorAdvice, viewDetailModal, activeKey,} = this.state;
    //console.log('rows',rows);

    //----------------------- 动态参数 ----------------------------------------
    let workGroupType = [];
    workGroupType = searchTextByValues('work_group_type');//模块名称---匹配字典表。
    /*--------- 遍历 workGroup类型 -----------*/
    const _Select = workGroupType.map((k)=>{
      let value = Number();
      return ( <Select.Option value={k.value} key={k.id}>{k.text}</Select.Option>  );
    });

    const formEle =( <Form layout="inline">
      <Form.Item //label="中文名"
      >
        {getFieldDecorator('nameCn', {
          rules: false
        })(
          <Input  placeholder="中文名" />
        )}
      </Form.Item>
      <Form.Item //label="英文名"
      >
        {getFieldDecorator('nameEn', {
          rules: false
        })(
          <Input  placeholder="英文名" />
        )}
      </Form.Item>
      <Form.Item //label="描述"
      >
        {getFieldDecorator('descInfo', {
          rules: false
        })(
          <Input  placeholder="描述" />
        )}
      </Form.Item>
      <Form.Item //label="工作组类型"
      >
        {getFieldDecorator('type', {
          rules: false
        })(
          <Select
            size="large"
            style={{width: 150, marginRight: '3%' }}
            placeholder={`请选择工作组类型`}
            //allowClear={true}
            multiple={false}
            combobox={false}
            tags={false}
            showSearch={false}
            filterOption={false}
            optionFilterProp={`children`}
            labelInValue={false}
            tokenSeparators={null}
          >
            {_Select}
          </Select>
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
        key: 'nameCn',
        name: '中文名',
        width: 150,
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
        name: '英文名',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'descInfo',
        name: '描述',
        width: 200,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'orgId',
        name: '机构',
        width: 150,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'type',
        name: '工作组类型',
        width: 100,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column:{key}})=>{
          //console.log('这是什么类型:',value);
          let _arr =[], text='';
          _arr = searchTextByValues('work_group_type');//模块名称---匹配字典表。
          if(_arr.length > 0) {
            _arr.map((item)=> {
              if (value === item.value) {
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
        name: '操作',
        key: 'operation',
        width: 150,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
         return (
           <div>
             <span onClick={this.viewDetailClick.bind(this, {rowdata: dependentValues})}><a>查看详细</a></span>
             <Divider type="vertical" />
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
            <AddDoctorAdvice {...addDoctorAdvice} callback={this.addCallback}/>
            <ViewDetailModal {...viewDetailModal} callback={this.viewDetailCallback}/>
          </div>
          <Card>
            <div style={{marginTop:-10, marginBottom: -5,}}>{formEle} </div>
            <Spin
              spinning={spinning}
              tip={tip}>
              <ButtonContainer>
                <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">创建工作组</Button>
                <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary" icon="edit">修改工作组</Button>
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
                scroll={{x: 950}}               //横向可滚动距离
              />
            </Spin>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

workGroupList.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
workGroupList.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

workGroupList = Form.create()(workGroupList);
const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(workGroupList);

