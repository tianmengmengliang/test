/**
 * Created by jpt on 2018/7/2 0002.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table,Tabs, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
//import styles from './style.less';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import { AddDeviceTypeModal, ViewDeviceProjectModal } from './modules/'
import moment from 'moment'
import {searchTextByValues }      from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchSampleTypeByValues} from 'antd/../../src/compoents2/location/SampleTypeList.js'; //匹配样本类型
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch, CONFIG}  from '../../../services/';

/**
 *  仪器列表模块
 *  作者: jpt
 * */
class DeviceList extends Component {
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
      addDeviceTypeModal: {                            // 新建
        title: '添加仪器',
        visible: false,
        data: {}
      },
      viewDeviceProjectModal: {
        title: '',
        visible: false,
        data: {}
      },
      activeKey: '1',                                    // 激活的tabPane的key，
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
   * @interface 获取仪器分页列表
   * */
  getDevicesTypleList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    // step2. 请求列表数据
    fetch('deviceType/list', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        this.setState({
          listPage
        });
      },
      error: (err)=>{
        // step1.
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
    /*this.setState( {
      selectedIds: this.state.selectedIds.concat( rows.map(r => r.row[this.props.rowKey])),
    });
    this.setState({
      selectedRows: this.state.selectedRows.concat( rows.map(r => r.row)),
    });*/
    //进行单选
    this.setState({
      selectedIds: rows.map(r => r.row[this.props.rowKey]),
    });
    this.setState({
      selectedRows: rows.map(r => r.row),
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

  //1.查询仪器的已选项目接口
  getDeviceProject = (selectId={}, callback = ()=>{})=>{
    fetch('deviceType/listByDeviceTypeId', {
      // method: 'post',
      // headers: {},
      data: selectId,
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

  //------------------------------- start 新增、修改  -----------------
  add = ({type,  data: selectedRows=[]})=>{
    if(type === 'add') {
      this.showAdd({data: {} });
    }
    if(type === 'edit') {
      //const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      //if(hasSelectedOnlyOneIdx){
      /**
       * 修改时selectedRows为 {}对象。
       * */
      if(true){
        //------------------------------------------------
        this.getDeviceProject({deviceTypeId: selectedRows[this.props.rowKey]}, (err, res = {})=> {
          if (err) {
            message.error('查询已选项目失败');
            return;
          }

          this.showAdd({
            data: {
              ...selectedRows,
              selectedRows: res.responseObject,
            },
          })
        })

      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addDeviceTypeModal})=>{
      return {
        addDeviceTypeModal: {
          ...addDeviceTypeModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addDeviceTypeModal})=>{
      return {
        addDeviceTypeModal: {
          ...addDeviceTypeModal,
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
  //-------------------------------- end 新增、修改--------------------------------


  //--------------------------------- start 删除订单--------------------------------
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
        content: '你确定要该记录？',
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
    fetch('deviceType/remove', {
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
  //---------------------------- end 删除订单 ----------------------------------


  //----------------------- start 查看详细Model ----------------------------------
  viewDetailClick = ({rowdata: selectedRows})=>{
    //------------------------------------
    this.showViewDetailModal({data: {...selectedRows}});

  };
  showViewDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewDeviceProjectModal})=>{
      return {
        viewDeviceProjectModal: {
          ...viewDeviceProjectModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewDeviceProjectModal})=>{
      return {
        viewDeviceProjectModal: {
          ...viewDeviceProjectModal,
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
            <Input  placeholder="中文名称" />
          )}
        </Form.Item>
        <Form.Item //label="医嘱英文"
        >
          {getFieldDecorator('nameEn', {
            rules: false
          })(
            <Input  placeholder="英文名称" />
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
      selectedIds, selectedRows, tip,  addDeviceTypeModal, viewDeviceProjectModal,
      activeKey, doctorDviceType, sampleType,} = this.state;
    //console.log('doctorDviceType',doctorDviceType);

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
            </div>
          )
        },
      },
      {
        name: '中文名称',
        key: 'nameCn',
        width: 200,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '英文名称',
        key: 'nameEn',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '品牌',
        key: 'brand',
        width: 120,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '生产厂家',
        key: 'manufacturer',
        width: 200,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '型号',
        key: 'model',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '注册证号',
        key: 'registration',
        width: 150,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '方法学',
        key: 'methodology',
        width: 100,
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
            <AddDeviceTypeModal  {...addDeviceTypeModal} callback={this.addCallback}/>
            <ViewDeviceProjectModal {...viewDeviceProjectModal} callback={this.viewDetailCallback}/>
          </div>

          <Card bordered={false}>
            <div style={{marginTop:-10, marginBottom:-5,}}>{this.renderForm()}</div>
            <Spin
              spinning={spinning}
              tip={tip}>
              <ButtonContainer>
                <Button onClick={this.add.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加仪器</Button>
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

DeviceList.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
DeviceList.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};
DeviceList = Form.create()(DeviceList);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(DeviceList);
