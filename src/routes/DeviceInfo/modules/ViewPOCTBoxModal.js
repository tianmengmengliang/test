/**
 * Created by jpt on 2018/4/11 0011.
 */
import React, { Component,  } from 'react';   //PropTypes
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Form,Card, Table, Upload, Icon, Input, InputNumber, message, Popconfirm, Divider, Select, Spin, DatePicker,
  Row, Col, Button,  Radio, Modal, notification, Checkbox } from 'antd'
//import styles from './style.less';
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from '../../../services/'
import {ModalA, GridTable,  ButtonContainer, AddButton, } from    '../../../compoents2/';
import {searchDeviceTypeByValues} from 'antd/../../src/compoents2/location/deviceType.js'; //匹配设备类型
import AddPOCTBoxModal from  './AddPOCTBoxModal';

//import './customTable.less'

function noop(){}


class ViewPOCTBoxModal extends Component{
  _retInitialState= ()=>{
    return {
      confirmLoading: false,
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,                                     // 第几页。
        pageSize: 10,                                     // 每页显示的记录条数。
        rows: [],
        total: 0
      },
      parentId: 0,                                        // 父节点
      addPOCTBoxModal: {
        title: 'poctBOX子模块',                        //poctBOX子模块添加、修改。
        visible: false,
        data: {}
      },
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState()
  }

  /* @interface 清空选择行; 行对象数据。
   * */
  resetSelectedRowsNIds = ()=>{
    this.setState({
      selectedIds: [],
      selectedRows: [],
    })
  };

  //------------------------------ start列表展示-------------------------------------------
  //componentDidMount(){
  //  const {listPage: {pageIndex, pageSize}} = this.state;
  //  this.getPOCTBoxModuleList({pageIndex, pageSize});
  //};

  componentWillReceiveProps(nextProps){ //当组件传入的 props变化时调用，更新state。
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    //console.log('nextProps',nextProps);
    if(visible && newData !== oldData){
      const {id } = newData;
      //console.log('newData',newData);
      if(!!id ){
        const { id }= newData;
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getPOCTBoxModuleList({pageIndex, pageSize, parentId: id });

        this.setState({
             parentId: id,
        });
      }
    }
  }


  _getAllListQuery = (pageQuery = {})=>{ //分页条件
    return {
      ...pageQuery
    }
  };

  getPOCTBoxModuleList = (query)=>{
    const _q = this._getAllListQuery(query);
    // step1. 请求列表数据
    fetch('api/device/pageListModule',{ //???/
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage} = res;
        console.log('查询接口:',listPage );
        this.setState({
          listPage
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
    })
  };
//--------------------------------end列表-----------------------------------------------

  //----------------- start 选中行------------------------------------------------
  /*
   * @interface Grid  1.行更新
   * */
  handleGridRowsUpdated = ({fromRow, toRow, updated })=> {
    console.log('handleGridRowsUpdated', arguments)
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
    console.log('选中行', rowIdx,'_行数据 ', clickedRow);
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
      console.log('选中rowIds', rowIds );

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
  //------------------ end -------------------------------------------

  //取消
  onCancel = ()=> {
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: this.props.data
    });
  };
//-------------------------------------------------------------------

//--------------------------------------- 查询设备类型 ---------------------------------
  //1.查询设备类型接口
  getDeviceType = ( callback=()=>{})=>{ //
    fetch('api/device/pageListDeviceType', {
      // method: 'post',
      // headers: {},
      data:{},
      success: (res)=>{
        console.log("--devicTypeGroup:--",res);
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
  add = ({type,  data: selectedRows = []})=>{
    const {parentId } = this.state;
    if(type === 'add') {
        /***********************************/
        this.getDeviceType((err, res)=> {//1.设备类型
          if (err) {
            message.warn(`查询设备类型不存在`);
            return;
          }
          const _daviceType = res.responseObject;
          /************************************/
          this.showAddPOCTBox({
            data: {
              devicTypeGroup: _daviceType, //设备类型
              parentId: parentId,    //父节点
            }
          });
        });
    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
        const row = selectedRows[0];
        /***********************************/
        this.getDeviceType((err, res)=> {//1.设备类型
          if (err) {
            message.warn(`查询设备类型不存在`);
            return;
          }
          const _daviceType = res.responseObject;
          /************************************/
          this.showAddPOCTBox({data: {...row,  devicTypeGroup: _daviceType, parentId: parentId}});
        });
      }else{
        return;
      }
    }
  };
  showAddPOCTBox = ({data})=>{
    this.setState(({addPOCTBoxModal})=>{
      return {
        addPOCTBoxModal: {
          ...addPOCTBoxModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAddPOCTBox = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addPOCTBoxModal})=>{
      return {
        addPOCTBoxModal: {
          ...addPOCTBoxModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addPOCTBoxCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAddPOCTBox();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      console.log(info);
      const {listPage: {pageIndex, pageSize}, parentId} = this.state;
      this.getPOCTBoxModuleList({pageIndex,pageSize, parentId});
      this.hiddenAddPOCTBox();
      return;
    }
  };
//----------------------------------- end 新增、修改 --------------------------------


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
          this.delPOCTBoxModule({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error('删除设备类型记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex,pageSize}, parentId } = this.state;
              this.getPOCTBoxModuleList({pageIndex,pageSize,  parentId})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  delPOCTBoxModule = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
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
//------------------------------------end 删除订单 -----------------------------------------


  /** 1.设置下拉列表固定 **/
  getPopup =( triggerNode )=>{
    return  triggerNode
  }
  /** 2.设置已过日期不可选 **/
  disabledDate =( current )=>{
    return current && current.valueOf() < Date.now();
  }
  /** 1.验证整数数值 **/
  disabledNumber =(rule, value, callback)=>{
    const reg= /^[0-9]*[1-9][0-9]*$/;
    if(reg.test(value) ){
      callback();
      return ;
    }else{
      callback('只能输整数!');
    }
  }
  /** 2.验证手机号码 **/
  checkTel = (rule, value, callback) => {
    var re1 = /^1\d{10}$/;
    var re2 = /^0\d{2,3}-?\d{7,8}$/;
    if(re1.test(value) ){
      callback();
      return ;
    }else if(re2.test(value) ){
      callback();
      return ;
    }else{
      callback('格式不对!');
    }
  }
  /** 3.验证中方联系人姓名的长度 **/
  disabledNameLength =(rule, value, callback)=>{
    const _reg = /^\s*\S((.){0,20}\S)?\s*$/;
    if(_reg.test(value) ){
      callback();
      return ;
    }else{
      callback(`限制少于20字!`);
    }
  }
  /** 3.1.验证英文联系人姓名的长度 **/
  disabledNameLength2 =(rule, value, callback)=>{
    const _reg = /^\s*\S((.){0,50}\S)?\s*$/;
    if(_reg.test(value) ){
      callback();
      return ;
    }else{
      callback(`限制少于50字!`);
    }
  }
  /** 4.验证文件上传不能为空  **/
  disabledNull =(rule, value, callback)=>{
    if(value === null ||value === ''){
      callback(`请下载样表，填写后转PDF格式上传`);
      return ;
    }else{
      callback();
    }
  }
  /** 5.字符串的长度 **/
  disabledLength =(rule, value, callback)=>{
    //console.log("限制少于400字",value);
    if(value === undefined || value === null){
      callback();
      return ;
    }else{
      if(value.length < 400){
        callback();
        return ;
      }else{
        callback(`限制少于400字!`);
      }
    }
  }

  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, spinning,parentId,
      selectedIds, selectedRows, tip, addPOCTBoxModal,  } = this.state;
    //console.log("——data数据",data )

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
        name: '编号',
        key: 'deviceNo',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '设备类型',
        key: 'deviceTypeId',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          const deviceTypeId= dependentValues.deviceTypeId;
          const _l = searchDeviceTypeByValues(deviceTypeId);
          return (
            <span>{_l["deviceType"]['nameCn']}</span>
          )
        },
      },
      {
        name: '放置位置',
        key: 'moduleIndex',
        width: 80,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '生产时间',
        key: 'productionTime',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD') : undefined}</span>
          )
        },
      },
      {
        name: '生产地址',
        key: 'productAddress',
        width: 100,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '注册时间',
        key: 'createTime',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=> {
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        },
      },
    ];
    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current: ', current, '; PageSize: ', pageSize); //pageSize 一页中显示的数量。
      },
      onChange: (current) => { //current 鼠标点击的第几页。
        console.log('Current: ', current);
        this.getPOCTBoxModuleList({pageIndex: current, pageSize, parentId})//分页列表查询。
      }
    };

    return (
      <div>
          <ModalA
            width={1000}
            confirmLoading={confirmLoading}
            title={title}
            visible={visible}
            //okText="保存"
            //cancelText="取消"
            //onOk={this.onOk}           //保存按钮。
            onCancel={this.onCancel}
            //bodyHeight={500}
            //bodyMinHeight={500}
            footer={[<Button key="submit" type="primary" size="large" onClick={this.onCancel}>关闭</Button>, ]}
            maskClosable={false}
            bodyStyle={{margin: 0}}
            bodyMinHeight={'auto'}
            //footer={null}
            //maskClosable={true}

            {...props}
          >
            <div className="hidden">
              <AddPOCTBoxModal
                {...addPOCTBoxModal}
                callback={this.addPOCTBoxCallback} />
            </div>

            <Spin
              spinning={spinning}
              tip={tip}>
              {/* 1.查询栏 */}
              <ButtonContainer>
                <Button onClick={this.add.bind(this, {type: 'add', data:{}})} type="primary"><Icon type="plus" />添加子模块</Button>
                <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary"><Icon type="edit" />修改</Button>
                <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger"><Icon type="close" />删除</Button>
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
                rowHeight={40}
                minHeight={450}
                rowScrollTimeout={0}
                onGridSort={this.handleGridSort}
                pagination={_pagination}
                scroll={{x: 1350}}               //横向可滚动距离
              />
            </Spin>
          </ModalA>
        </div>
    )
  }
}

ViewPOCTBoxModal.propTypes = {
  data: PropTypes.any,
  visible: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  confirmLoading: PropTypes.bool,

  footer: PropTypes.any,
  maskClosable: PropTypes.bool,
  closable: PropTypes.bool,
  afterClose: PropTypes.func,
  style: PropTypes.object,
  width: PropTypes.any,
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

ViewPOCTBoxModal.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id',
  visible: false,
  callback: noop,
};
//-----------------------------------

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};

ViewPOCTBoxModal = Form.create()(ViewPOCTBoxModal);
export default ViewPOCTBoxModal;
