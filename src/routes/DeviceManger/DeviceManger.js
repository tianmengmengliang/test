/**
 * Created by jpt on 2018/4/3 0003.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon,   } from 'antd';
import styles from './style.less';
import { GridTable, ButtonContainer, MapGaode, } from '../../compoents2/';
import { DeviceMangerModal, } from './modules/'
import moment from 'moment'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {fetch, } from '../../services/'

//------------------ 怎么把Json数据 转成Json树状结构! -----------------------------
function fn(data, pid) {
  var result = [], temp;
  for (var i = 0; i < data.length; i++) {
    if (data[i].parentId == pid) {
      var obj = {'id': data[i].id,  'value': data[i].id,  'label': data[i].name, 'parentId': data[i].parentId };

      temp = fn(data, data[i].id);
      if (temp.length >0){
        obj.children = temp;
      }
      result.push(obj);
    }
  }
  return result;
}
//-------------------------------------------------------------------------------------


/**
 * 设备管理页
 * @function 复合组件中促使子组件加载
 * */
class DeviceManger extends Component {
  _retInitialState = ()=>{
    return {
      devicTypeGroup: [],
      deviceType : 'JS3000',                              //设备类型。

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
      deviceRegisterModal: {                            // 新建
        title: '新设备注册',
        visible: false,
        data: {}
      },
      viewPOCTBoxModal:{
        title: 'poctBOX子模块',
        visible: false,
        data: {}
      },
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
    //获取设备状态。
    this.getDeviceStatusList({pageIndex, pageSize});
    //获取设备类型
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
   * @interface 获取设备状态列表
   * */
  getDeviceStatusList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    //console.log("--请求参数:", _q);
    // step2. 请求列表数据
    fetch('api/device/listDeviceStatus', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        //console.log("--响应数据:", listPage);
        this.setState({
          listPage
        });
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
    console.log('handleGridRowsUpdated',arguments)
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

  //1.查询省市区接口
  getResidencesData = ( callback=()=>{})=>{ //
    fetch('api/device/areaList', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        console.log("----Residences:----",res);
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
    if(type === 'add') {
      /***********************************/
      this.getResidencesData((err, res)=> { //1、获取省市区
        if(err){
          message.warn(`查询所在地位置不存在`);//可能。
          return;
        }
        const _data= res.responseObject;
        // ---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历
        let dataSource = fn(_data, 0);

        /***********************************/
        this.getDeviceType((err, res)=> { //2.设备类型
          if (err) {
            message.warn(`查询设备类型不存在`);//可能。
            return;
          }
          const _daviceType = res.responseObject;
          /************************************/
          this.showAdd({
            data: {
              residences: dataSource,
              devicTypeGroup: _daviceType,
            }
          });
        });
      });
    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
        /***********************************/
        this.getResidencesData((err, res)=> { //1、获取省市区
          if(err){
            message.warn(`查询所在地位置不存在`);//可能。
            return;
          }
          const _data= res.responseObject;
          // ---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历
          let dataSource = fn(_data, 0);

          /***********************************/
          this.getDeviceType((err, res)=> { //2.设备类型
            if (err) {
              message.warn(`查询设备类型不存在`);//可能。
              return;
            }
            const _daviceType = res.responseObject;
            /************************************/
            this.showAdd({data: {...selectedRows[0], residences: dataSource, devicTypeGroup: _daviceType } });
          });
        });
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({deviceRegisterModal})=>{
      return {
        deviceRegisterModal: {
          ...deviceRegisterModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({deviceRegisterModal})=>{
      return {
        deviceRegisterModal: {
          ...deviceRegisterModal,
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
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceStatusList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
  //-----------------------------------end 新增、修改 --------------------------------


  //----------------------------------- 条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getDeviceStatusList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getDeviceStatusList({pageIndex: 1, pageSize})
  };
  //---------------------------------------------------------------------------------


  //-------------------------------- start poctbox添加模块位置操作-----------------------------------
  //0.查看子模块
  viewPOCTBoxClick = ({rowdata: selectedRows})=>{
    console.log('selectedRows',selectedRows);
    this.showViewPOCTBoxModal({data: {...selectedRows}});
  };
  //--------------------------------- 位置操作------------------------------------


  //------------------------------ start 选中一类设备列表 ----------------------------
  deviceCardListClick = ({data: selectedRows})=>{
    this.setState({
       deviceType: selectedRows['nameEn'],
    })
      // case1.重置查询条件、重置selectedIds、重新渲染列表。
      this.props.form.resetFields();

      this.resetSelectedRowsNIds();
      // case2. 查找一类设备。如：所有的就j3000.
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceStatusList({pageIndex, pageSize, deviceType: selectedRows['nameEn']})
  };

  getOneOfDeviceList = (selectedId = {}, callback = ()=>{})=>{ // case2. id查找一类设备。如：所有的就j3000.
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
    const { form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const {devicTypeGroup, deviceType, listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, deviceRegisterModal, viewPOCTBoxModal,  } = this.state;
    //console.log('devicTypeGroup',devicTypeGroup);

    const gridStyle = {
      width: 'auto', //div内容撑开宽度,
      height: 50,
      textAlign: 'center',
      float: 'Left',
      marginLeft:'1%',
      //marginButtom: 10,
      padding: 10,
      borderRadius: 5,
      background: '#00a29a',
    };


    const formEle =(
      <Form layout='inline'>
        <Form.Item label="设备编号">
          {getFieldDecorator('deviceNo', {
            rules: false
          })(
            <Input  placeholder="不限" />
          )}
        </Form.Item>
        {/*<Form.Item label="设备标识码">
          {getFieldDecorator('deviceSn', {
            rules: false
          })(
            <Input  placeholder="不限" />
          )}
        </Form.Item>*/}
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
        name: '设备标识码',
        key: 'deviceSn',
        width: 100,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '设备状态',
        key: 'status',
        width: 80,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          switch(value){
            case 0 :  return (<span style={{color:'#f00'}}>{'离线'}</span> );  break;
            case 1 :  return (<span style={{color:'#00EA00'}}>{'运行中' }</span>);  break;
            default :  return (<span style={{color:'#F9A704'}}>{'情况未知' }</span>)
          }
        },
      },
      {
        name: '运行状况',
        key: 'exceptionStatus',
        width: 80,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          switch(value){
            case 0 :  return (<span style={{color:'#00EA00'}}>{'正常'}</span> );  break;
            case 1 :  return (<span style={{color:'#f00'}}>{'异常...' }</span>);  break;
            default :  return (<span style={{color:'#F9A704'}}>{'情况未知' }</span>)
          }
        },
      },
      {
        name: '设备所在地',
        key: 'address',
        width: 200,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
      {
        name: '坐标',
        key: 'lng',
        width: 200,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{ //
          //console.log('dependentValues',dependentValues);
          const _lng= dependentValues.lng , _lat =dependentValues.lat ;
          return  <span>[{_lng},&nbsp;{_lat}]</span>
        },
      },
      {
        name: '产生时间',
        key: 'createTime',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        },
      },
      {
        name: '终止时间',
        key: 'lastTime',
        width: 150,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
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
                <span onClick={this.add.bind(this, {type: 'edit', data: dependentValues})}><a>设备数据列表</a></span>
                <Divider type="vertical" />
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
        this.getDeviceStatusList({pageIndex: current, pageSize, deviceType})
      }
    };

    //render()里面定义的变量为，临时变量。
    let devicType = {id:0,  nameCn:'全部设备', nameEn: null};

    return (
        <div className="yzh-d-remained-manger">
            <Row>
              <Col>
                <Card title="设备类型列表">
                  <div style={gridStyle} key={0} onClick={this.deviceCardListClick.bind(this,{data: devicType})}>{devicType.nameCn} </div>
                  {devicTypeGroup.map((key, index)=>{
                    return(
                      <div style={gridStyle} key={key.id} onClick={this.deviceCardListClick.bind(this,{data: key})}>{key.nameCn} </div>
                    )
                  })}
                </Card>
              </Col>
            </Row>

            <Row>
              {/*---- 1.状态列表 ---*/}
              <Col span={14} offset={0}>
                <div className="hidden">
                  <DeviceMangerModal
                    {...deviceRegisterModal}
                    callback={this.addCallback} />
                </div>
                <Card title={deviceType}>
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
                          scroll={{x: 1350}}               //横向可滚动距离
                        />
                      </Spin>
                </Card>
              </Col>

              {/*---- 2.高德地图 -<Card bordered={false}></Card>--*/}
              <Col span={10} offset={0}>
                <Card bordered={false} bodyStyle={{height:612}}>
                   <MapGaode height={540} dataSource={dataSource}  />
                </Card>
              </Col>
            </Row>
        </div>
    );
  }

}

DeviceManger.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

DeviceManger.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

DeviceManger = Form.create()(DeviceManger);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(DeviceManger);
