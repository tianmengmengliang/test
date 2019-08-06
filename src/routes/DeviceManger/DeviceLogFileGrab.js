/**
 * Created by jpt on 2018/4/23 0023.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon,   } from 'antd';
import styles from './style.less';
import { GridTable, ButtonContainer, MapGaode, } from '../../compoents2/';
import { DeviceMangerModal, DeviceLogGrabModal, LogFileGrabList } from './modules/';
import {searchLocationByValues} from 'antd/../../src/compoents2/location/location.js'; //匹配省市区
import {searchDeviceTypeByValues} from 'antd/../../src/compoents2/location/deviceType.js'; //匹配设备类型

import moment from 'moment'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {fetch, } from  '../../services/'


class DeviceLogFileGrab extends Component {
  _retInitialState = ()=>{
    return {
      devicTypeGroup: [],
      tableTitle: '',
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      deviceLogGrabModal: {                            // 新建
        title: '取设备的运行日志文件',
        visible: false,
        data: {},
      },
      LogFileListLoading: false,                      //子组件是否加载。

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
    this.getDeviceRegisterList({pageIndex, pageSize});
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
  getDeviceRegisterList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    //console.log("--请求参数:", _q);
    // step2. 请求列表数据
    fetch('api/device/pageListDeviceInfo', {
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
  add = ({type,  data: selectedRows ={}})=>{
    if(type === 'add') {
    }
    if(type === 'edit') {
          /***********************************/
          this.getDeviceType((err, res)=> { //2.设备类型
            if (err) {
              message.warn(`查询设备类型不存在`);
              return;
            }
            const _daviceType = res.responseObject;
            /************************************/
            this.showAdd({data: {...selectedRows, devicTypeGroup: _daviceType } });
          });
    }
  };
  showAdd = ({data})=>{
    this.setState(({deviceLogGrabModal})=>{
      return {
        deviceLogGrabModal: {
          ...deviceLogGrabModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({deviceLogGrabModal})=>{
      return {
        deviceLogGrabModal: {
          ...deviceLogGrabModal,
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
      const {listPage: {pageIndex, pageSize}, LogFileListLoading} = this.state;
      this.getDeviceRegisterList({pageIndex, pageSize});

      this.LogFileListLoad({LogFileListLoading});
      this.hiddenAdd();
      return;
    }
  };
  //-----------------------------------end 新增、修改 --------------------------------
  //------------------------------------------------------------
  /*
   * @interface 促使子组件加载
   * */
  LogFileListLoad = ()=>{ //显示查看对话框
    this.setState({LogFileListLoading: true});
  };
  LogFileListCallback =() =>{
    this.setState({LogFileListLoading: false});

  }
  //-------------------------------------------------------------------------


  //----------------------------------- 条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getDeviceRegisterList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getDeviceRegisterList({pageIndex: 1, pageSize})
  };
  //---------------------------------------------------------------------------------




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
        this.getDeviceRegisterList({pageIndex, pageSize})
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
//------------------------------------end 设备类型选择 --------------------------------------

  render() {
    const { form, ...props} = this.props;
    const { getFieldDecorator } = form;
    const {devicTypeGroup, tableTitle, listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, deviceLogGrabModal, LogFileListLoading,} = this.state;
    console.log('LogFileListLoading1', LogFileListLoading);

    const gridStyle = {
      width: '22%',
      textAlign: 'center',
      marginLeft:'2%',
      //marginTop: 10,
      background: '#00a29a',
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

    const _columns = [
      {
        name: '序号',
        key: 'id',
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
        name: '类型',
        key: 'deviceTypeId',
        width: 150,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          const deviceTypeId= dependentValues.deviceTypeId;
          const _l = searchDeviceTypeByValues(deviceTypeId);
          return (
            <span>{_l["deviceType"]['nameCn']}</span>
          )
        },
      },
      {
        name: '设备编号',
        key: 'deviceNo',
        width: 100,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '标识码',
        key: 'deviceSn',
        width: 100,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '操作',
        key: 'operation',
        width: 150,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <Button onClick={this.add.bind(this, {type:'edit', data: dependentValues})} type="primary">抓取设备日志 </Button>
              <Divider type="vertical" />
            </div>
          )
        },
      },
      {
        name: '设备所在地',
        key: 'address',
        width: 200,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{ //
          //console.log('dependentValues',dependentValues);
          const provinceId= dependentValues.province , cityId =dependentValues.city, zoneId= dependentValues.zone ;
          const _l = searchLocationByValues(parseInt(provinceId), parseInt(cityId),parseInt(zoneId) );
          return  <span>{_l["province"]['name']}-{_l["city"]["name"]}-{_l["zone"]["name"]}</span>
        },
      },
      {
        name: 'SIM卡',
        key: 'imsi',
        width: 100,
        sortable: false,
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
        this.getDeviceRegisterList({pageIndex: current, pageSize})
      }
    };

    return (
      <PageHeaderLayout>
        <div className="yzh-d-remained-submit-approval">
          <Row>
              <Col span={16} offset={0}>
                <div className="hidden">
                  <DeviceLogGrabModal
                    {...deviceLogGrabModal}
                    callback={this.addCallback} />
                </div>
                <Card title={tableTitle} >
                  {formEle}
                  <Spin spinning={spinning} tip={tip}>
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
                      //scroll={{x: 1050}}               //横向可滚动距离
                    />
                  </Spin>
                </Card>
              </Col>

              {/*---- 2.高德地图  bordered={false}
              <Col span={10}>
                <Card>
                    <MapGaode height={510} />
                </Card>
              </Col>--*/}
          </Row>

          <Row>
            <Col span={24} offset={0}>
                <LogFileGrabList  LogFileListLoading={LogFileListLoading} callback={this.LogFileListCallback} />
            </Col>
          </Row>
        </div>
      </PageHeaderLayout>
    );
  }
}

DeviceLogFileGrab.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

DeviceLogFileGrab.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

DeviceLogFileGrab = Form.create()(DeviceLogFileGrab);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(DeviceLogFileGrab);
