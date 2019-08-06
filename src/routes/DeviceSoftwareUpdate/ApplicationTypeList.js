/**
 * Created by jpt on 2018/4/26 0026.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker,
  Modal, notification, Icon, Badge, Menu, Dropdown,} from 'antd';
import styles from './style.less';

import { GridTable, ButtonContainer, MapGaode, } from '../../compoents2/';
import { DeviceMangerModal, DeviceLogGrabModal, LogFileGrabList } from '../DeviceManger/modules/';
import {AddApplicationTypeModal, ViewAndUpdataFileModal } from './modules/';
import {searchDeviceTypeByValues} from 'antd/../../src/compoents2/location/deviceType.js'; //匹配设备类型
import moment from 'moment'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {fetch, } from  '../../services/'


class ApplicationTypeList extends Component {
  _retInitialState = ()=>{
    return {
      devicTypeGroup: [],
      tableTitle: '',
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据
      selectedRows: [],                                   // 选中的行ids
      selectedRowKeys: [],
      expandedRowKeys: [],                               // ????
      editTableListPage: {                               // 二级表的分页数据。
        pageIndex: 1,
        pageSize: 999,
        rows: [],
        total: 0
      },
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      addApplicationTypeModal: {                         //新建
        title: '新增应用类型',
        visible: false,
        data: {}
      },
      viewAndUpdataFileModal:{                           //上传应用
        title: '设备应用软件包上传',
        visible: false,
        data: {}
      },
    }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  //-------------------- start子表格 ----------------------
  /**
   * @interface 子表格
   *
   */
  expandedRowRender = (_pRecord, index) => {
    let status, listPage = this.state.editTableListPage;
    const editTableData = this.state[`data-recordId${_pRecord[this.props.rowKey]}`];
    if(editTableData){
      status = editTableData['status'];
      listPage = editTableData['listPage'];
    }
    const formProps = {size: 'small' };
    const borderStyle= {border:"1px solid #B8CCE2",padding:2, cursor:'pointer'};
    //const userRole = localStorage.getItem(USER_ROLE);

    const menu = (<Menu>
      <Menu.Item>
        Action 1
      </Menu.Item>
      <Menu.Item>
        Action 2
      </Menu.Item>
    </Menu> );
    const columns2 = [
      {title: '序号', dataIndex: 'sn', key: 'sn', render: (value, record, i)=>{ return i + 1}},
      { title: '日期', dataIndex: 'createTime',   key: 'createTime',  render: (value, record, i)=>{return ( <span>{ value ?  moment(value).format('YYYY-MM-DD HH:mm:SS') : value }</span>)} },
      { title: '文件名', dataIndex:'downloadPath', key: 'downloadPath', render: (value, record, i)=>{return ( <span>{ value}</span>)} },
      { title: '功能描述', dataIndex: 'descInfo',  key: 'descInfo', render: (value, record, i)=>{return (<span>{ value}</span>)} },
      { title: 'Status', key: 'state', render: () => <span><Badge status="success" />Finished</span> },
      { title: '版本', dataIndex: 'version', key: 'version', render: (value, record, i)=>{return ( <span>{ value}</span>)}  },
      { title: '发布',
        dataIndex: 'operation',
        key: 'operation',
        render: () => (
          <span className="table-operation">
              <Button type="primary"><Icon type="cloud-upload-o"/>发布</Button>
              <Divider type="vertical" />
              <Dropdown overlay={menu}>
                <a href="javascript:;">
                  More <Icon type="down" />
                </a>
              </Dropdown>
          </span>
        ),
      },
    ];

    const {rows: dataSource} = listPage;
    const isSubmitBtnDisabled = dataSource.some((row)=>{ return row["status"] == 0});//some如果有一个元素满足条件，则表达式返回true。

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
              style={{maxWidth: 950, backgroundColor: '#fff'}}
              size="small"
              bordered
              columns={columns2}
              dataSource={dataSource}
              pagination={false}
              scroll={{x: 900}}/>
          </div>
        }
      </Spin>
    );
  };

  resetSelectedRowsNIds = ()=>{ //清空行选择数据
    this.setState({
      selectedIds: [],
      selectedRows: [],
      selectedRowKeys: [],
    })
  };

  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getApplicationTypeList({pageIndex, pageSize});
    //
    this.getDeviceType();
  }


  /**
   * 1.查询及请求参数。
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
  getApplicationTypeList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    //console.log("--请求参数:", _q);
    // step2. 请求列表数据
    fetch('api/device/pageListUpdateApplicationType', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        //console.log("--响应数据:", listPage);
        this.setState({
          listPage,
        });
      },
      error: (err)=>{
        // step1.
        message.error(err.message);
      },
      beforeSend: ()=>{
        this.setState({
          tableLoading: true,
        })
      },
      complete: (err, data)=>{
        this.setState({
          tableLoading: false,
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
   * @interface 获取列表的某一条记录，的情况列表。
   * @param {object} data  请求参数数据。
   */
  getUserLogList = (data, callback)=>{
    fetch('api/device/pageListUpdateApplicationDetails', {
      // method: 'post',
      // headers: {},
      data: data,
      success: (res)=>{
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
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
   * @param {object} record    选中的一行的记录数据。
   * @param {bool} expanded    是否展开。
   */
  onExpand = (expanded, record)=>{
    console.log('--expanded--', expanded);
    if(expanded){
      this.getUserLogList({applicationTypeId: record.id, pageIndex: 1, pageSize: 999}, (err, res)=>{
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
        console.log('--responseObject--', responseObject);

        //响应的数据渲染到每一个子表上？？？？
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
    console.log('选中行接口', rows);
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
        this.setState({
          devicTypeGroup: res.responseObject,
        })
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
  add = ({type,  data: selectedRows =[]} )=>{
    if(type === 'add') {
      /***********************************/
      this.getDeviceType((err, res)=> {//设备类型查询
        if (err) {
          message.warn(`查询设备类型不存在`);
          return;
        }
        const _daviceType = res.responseObject;
        /************************************/
        this.showAdd({data: {devicTypeGroup: _daviceType,}});
      });
    }
    if(type === 'edit') {
      //1.是否选中一行判断。
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
      if (hasSelectedOnlyOneIdx) {
          /***********************************/
          this.getDeviceType((err, res)=> { //2.设备类型
            if (err) {
              message.warn(`查询设备类型不存在`);
              return;
            }
            const _daviceType = res.responseObject;
            /************************************/
            this.showAdd({data: {...selectedRows[0], devicTypeGroup: _daviceType } });
          });
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addApplicationTypeModal})=>{
      return {
        addApplicationTypeModal: {
          ...addApplicationTypeModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addApplicationTypeModal})=>{
      return {
        addApplicationTypeModal: {
          ...addApplicationTypeModal,
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
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getApplicationTypeList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
  //-----------------------------------end 新增、修改 -------------------------------

  //-----------------------------------start 删除订单--------------------------------
  /*
   * @interface 删除一条通知记录
   * */
  delOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
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
    fetch('api/device/delectDeviceInfo', {
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
  //------------------------------------end 删除注册设备 -----------------------------


  //----------------------------------- 条件查询 -------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getApplicationTypeList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getApplicationTypeList({pageIndex: 1, pageSize})
  };
  //---------------------------------------------------------------------------------
   //E:\workspace\.metadata\.plugins\org.eclipse.wst.server.core\tmp0\wtpwebapps\ueditor1_4_3-utf8-jsp\ueditor\jsp\upload\image\20180504

  //------------------------------ start 选中一类设备列表 ----------------------------
  deviceCardListClick = ({data: selectedRows})=>{
    this.setState({
      tableTitle: selectedRows['nameCn'],
    })

    // step1. 判断是否只选中块数据
    this.getOneOfDeviceList({deviceTypeId: selectedRows['id']}, (err, res = {})=> {
      if (err){
        message.error('设备类型失败');
      } else {
        // case2. 重置selectedIds、重新渲染列表
        this.resetSelectedRowsNIds();

        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getApplicationTypeList({pageIndex, pageSize})
      }
    });
  };
  getOneOfDeviceList = (selectedId = {}, callback = ()=>{})=>{ //1.根据id查找一类设备。如：所有的就j3000.
    fetch('api/device/delectDeviceInfo', {
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
      },
      complete: (err, data)=>{
      }
    })
  };
  //------------------------------ end 设备类型选择 -----------------------------


  //----------------------------- start 上传文件的对话框 ------------------------
  /**
   *  @interface 上传文件按钮触发
   */
  updataApplicationFile = ({ data: selectedRow ={}})=>{
    //console.log('上传', selectedRow );
    this.showViewCheckNotificationModal({id: selectedRow.id});
  };
  showViewCheckNotificationModal = (data)=>{
    this.setState(({viewAndUpdataFileModal})=>{
      return {
        viewAndUpdataFileModal: {
          ...viewAndUpdataFileModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewNotification = ()=>{
    this.setState(({viewAndUpdataFileModal})=>{
      return {
        viewAndUpdataFileModal: {
          ...viewAndUpdataFileModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  viewUseOrderCallback = (info)=>{ //查看明细信息的回调
    const {click, data} = info;
    //console.log('点击取消按钮的回调函数',data);
    if(click === 'cancel') {
      //隐藏对话框
      this.hiddenViewNotification();
      this.setState({});
    }
    // 如果点击确定按钮，则提交表单。
    if(click === 'ok'){
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getApplicationTypeList({pageIndex, pageSize}); //父列表刷新。
      this.hiddenViewNotification();
      console.log("新增一行记录:", data );
      let record = {
        id: data.applicationTypeId,
        ...data
      };

      this.onExpand(true, record);
      return;
    }
  };


  //----------------------- 复选 ------------------------------
  onSelectChange = (selectedRowKeys, selectedRows) => {
    //console.log('selectedRowKeys changed: ', selectedRowKeys);
    //console.log('selectedRows changed: ', selectedRows);
    this.setState({ selectedRowKeys, selectedRows});
  }

  render() {
    const { form, ...props} = this.props;
    const { getFieldDecorator } = form;
    const {devicTypeGroup, tableTitle, listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRowKeys,selectedRows, tip, addApplicationTypeModal, viewAndUpdataFileModal,
      expandedRowKeys,defaultExpandAllRows,  } = this.state;

    const rowSelection = {
      //fixed: true,
      selectedRowKeys,  //指定选中项的 key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };

    const formEle =(
      <Form layout='inline'>
        <Form.Item label="设备类型">
          {getFieldDecorator('deviceTypeId', {
            rules: false
          })(
            <Input  placeholder="不限" />
          )}
        </Form.Item>
        <Form.Item label="应用名称">
          {getFieldDecorator('typeName', {
            rules: false
          })(
            <Input  placeholder="不限" />
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
      </Form>
    );
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
        title: '设备类型',
        dataIndex: 'deviceTypeId',
        key: 'deviceTypeId',
        width: 100,
        //sorter: true,
        render: (value, record, i)=>{
          const _l = searchDeviceTypeByValues(value);
          return (
            <span>{_l["deviceType"]['nameCn']}</span>
          )
        }
      },
      {
        title: '应用名称 ',
        dataIndex: 'typeName',
        key: 'typeName',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '应用描述',
        dataIndex: 'descInfo',
        key: 'descInfo',
        width: 200,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 150,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>
               <Button onClick={this.updataApplicationFile.bind(this, {data: record })} type="primary" icon="file" size='small'>上传文件</Button>
            </span>
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
        this.getApplicationTypeList({pageIndex: current, pageSize})
      }
    };
    return (
        <div className="yzh-d-remained-submit-approval">
          <Row>
            <Col span={24} offset={0}>
              <div className="hidden">
                <AddApplicationTypeModal
                  {...addApplicationTypeModal}
                  callback={this.addCallback} />
                <ViewAndUpdataFileModal    // +对话框
                  {...viewAndUpdataFileModal}
                  callback={this.viewUseOrderCallback}/>
              </div>

              <Card title={tableTitle} >
                {formEle}
                {/*<Spin spinning={spinning} tip={tip}>
                  <ButtonContainer>
                    <Button onClick={this.add.bind(this, {type: 'add', data:{}})} type="primary"><Icon type="plus" />新增更新应用类型</Button>
                    <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary"><Icon type="edit" />修改</Button>
                    <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger"><Icon type="close" />删除</Button>
                  </ButtonContainer>
                  <GridTable
                    tableLoading={tableLoading}
                    dataSource={dataSource}
                    columns={_columns}
                    expandedRowRender={expandedRowRender}

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
                    //scroll={{x: 1050}}               //横向可滚动距离
                  />
                </Spin>*/}
                 <Spin spinning={spinning} tip={tip}>
                    <ButtonContainer>
                      <Button onClick={this.add.bind(this, {type: 'add', data:{}})} type="primary"><Icon type="plus" />新增更新应用类型</Button>
                      <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary"><Icon type="edit" />修改</Button>
                      <Button onClick={this.delOrderClick.bind(this, {data: selectedRowKeys})} type="danger"><Icon type="close" />删除</Button>
                    </ButtonContainer>

                    <Table
                      className={styles['components-table-demo-nested']}
                      loading={tableLoading}
                      //size="small"
                      //bordered
                      rowKey={record => record.id}
                      rowSelection={rowSelection}
                      columns={_columns1}

                      rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
                      expandedRowKeys={expandedRowKeys}  //????
                      expandedRowRender={this.expandedRowRender}
                      onExpand={this.onExpand}   //点击“+”展开
                      onExpandedRowsChange={this.onExpandedRowsChange}

                      dataSource={dataSource}
                      pagination={_pagination}       //分页
                    />
                </Spin>
              </Card>
            </Col>

          </Row>
        </div>
    );
  }
}

ApplicationTypeList.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

ApplicationTypeList.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

ApplicationTypeList = Form.create()(ApplicationTypeList);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(ApplicationTypeList);
