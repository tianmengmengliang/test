/**
 * Created by jpt on 2018/6/28 0028.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Checkbox, Button, Select, Radio, Upload, Icon, Input, DatePicker, Modal,
  Popconfirm, InputNumber, message, Divider, } from 'antd'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import { ObjectUtilities } from '../../../../lib/';

import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';

function noop(){}

/**
 * 报告单模板。
 * */
class ViewReportModal extends Component{
  _retInitialState = ()=>{
    return {
      confirmLoading: false,
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      dataSource: [],
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState();
  }

  /*
   * @interface 清空选择行; 行对象数据。
   * */
  resetSelectedRowsNIds = ()=>{
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    })
  };

//--------- start 查询 ProjectIds分页列表接口 --------------------------
  _getAllListQuery = (pageQuery = {})=>{ //分页条件
    return {
      ...pageQuery
    }
  };
  //--------------------------------end列表----------------------

  componentDidMount(){}



  componentWillReceiveProps(nextProps){ // 如果属性发生变化，则重新渲染
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(newData !== oldData) {
      if(newData !== undefined) {
        this.setState({
          dataSource:  newData.dataSource,
        });
      }
    }
  }

  //------- 表单提交 ----------------------------
  onOk = ( {data: arrSelectIds} )=> {};
  onCancel = ()=> {
    /* 回调父组件的callback函数*/
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields()
  };
  //---------------------------------------------------------


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

  //------------- 删除该条记录 ----------------------------------------
  delRowClick =( {rowdata: record} ) =>{
    //console.log('record', record);
    Modal.confirm({
      width: 416,
      iconType: 'exclamation-circle',
      title: '',
      content: '你确定要删除该条记录？',
      okText: '确认删除',
      cancelText: '我再想想',
      maskClosable: false,
      onOk: ()=> {
        let _selectedIds = [], _selectedRows = [];//最后的新数组;
        const { listPage: {rows} } = this.state;
        rows.map((item)=>{
          if(item.id !== record.id){
            _selectedIds.push(item.id);
            _selectedRows.push(item);
          }
        });

        this.setState({
          selectedRowKeys: _selectedIds,
          listPage: {rows: _selectedRows},
        })
      },
      onCancel: ()=> {
      }
    });
  }


  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, tableLoading, spinning, tip, selectedRowKeys,} = this.state;

    //----------------------- 动态遍历 ----------------------------------------
    const {dataSource=[], labInformation={} }= data;
    //console.log('data', data);
    //console.log('dataSource', dataSource);

    const _data = ( <div style={{marginTop:0,}}>
        <div style={{textAlign: 'center',fontFamily:'宋体',fontSize:26, fontWeight:600,}}><span>{labInformation.name}</span></div>
        <div style={{textAlign: 'center',fontFamily:'宋体',fontSize:26, fontWeight:600,}}><span>即检（POCT）实验室检验报告单</span></div>
        <Divider style={{marginTop:4, marginBottom:5}} />
        <div style={{fontFamily: '宋体',fontSize: 16,fontWeight: 600,}}>
          <Row>
            <Col span={6}><span>姓名: {data.name} </span></Col>
            <Col span={6}><span>性别: {data.sex === 1? '男': '女'}</span></Col>
            <Col span={6}><span>年龄: {data.age}岁</span></Col>
            <Col span={5}><span>送检科室: {data.deptName}</span></Col>
          </Row>
          <Row>
            <Col span={6}><span>样本种类: {data.sampleType}</span></Col>
            {/*<Col span={6}><span>报告单号: {data.reportCode} </span></Col>
             <Col span={4}><span>医生: {data.testDoctorName} </span></Col>*/}
            <Col span={6}><span>样本号: {data.sampleCode} </span></Col>
            <Col span={6}><span>临床诊断: {data.diagnosis} </span></Col>
            <Col span={3}><span> </span></Col>
          </Row>
        </div>
        <Divider style={{marginTop:10, marginBottom:2}}/>
      </div>
    );

    let code=[], code2=[];
    if(dataSource.length > 0){
      // case1.
      if(dataSource.length <= 16 ){
          for (let i= 0; i < dataSource.length; i++){  //左边表格。
            code.push(<tr>
                <td width="15%">{dataSource[i].nameEn}</td>
                <td width="35%">{dataSource[i].nameCn}</td>
                <td width="15%">{dataSource[i].result}{dataSource[i].arrow}</td>
                <td width="15%">{dataSource[i].unit}</td>
                <td width="20%">{dataSource[i].referenceRange}</td>
             </tr>
            );
          }
          /*for (let j= dataSource.length ; j<16; j++){ //补全左边表格空余。
              code.push( <tr>
                <td width="10%">&emsp;</td>
                <td width="40%">&emsp;</td>
                <td width="15%">&emsp;</td>
                <td width="15%">&emsp;</td>
                <td width="20%">&emsp;</td></tr>
              );
          }
          for (let i = 16; i< 32; i++) {
            code2.push( <tr>
              <td width="10%">&emsp;</td>
              <td width="40%">&emsp;</td>
              <td width="15%">&emsp;</td>
              <td width="15%">&emsp;</td>
              <td width="20%">&emsp;</td></tr>
            );
          }*/
      }
      // case2.
      else if( dataSource.length > 16 ){
          for (var i = 0; i < 16; i++) {
            code.push(<tr>
                <td width="15%">{dataSource[i].nameEn}</td>
                <td width="35%">{dataSource[i].nameCn}</td>
                <td width="15%">{dataSource[i].result}{dataSource[i].arrow}</td>
                <td width="15%">{dataSource[i].unit} </td>
                <td width="20%">{dataSource[i].referenceRange}</td>
              </tr>
            );
          }
          for (var i = 16; i < dataSource.length; i++) { //右边表格。
            code2.push(<tr>
                <td width="15%">{dataSource[i].nameEn}</td>
                <td width="35%">{dataSource[i].nameCn}</td>
                <td width="15%">{dataSource[i].result}{dataSource[i].arrow}</td>
                <td width="15%">{dataSource[i].unit} </td>
                <td width="20%">{dataSource[i].referenceRange}</td>
              </tr>
            );
          }
          for (var i = dataSource.length; i < 32; i++) { //补全右边表格空余。
            code2.push(<tr>
                <td width="15%">&emsp;</td>
                <td width="35%">&emsp;</td>
                <td width="15%">&emsp;</td>
                <td width="15%">&emsp;</td>
                <td width="20%">&emsp;</td>
              </tr>
            );
          }
      }
    }

    const tableThead = (
        <thead>
          <tr height="20px" width="100%">
            <td width="15%">NO</td>
            <td width="35%">项目</td>
            <td width="15%">结果</td>
            <td width="15%">单位</td>
            <td width="20%">参考值</td>
          </tr>
        </thead>
    );
    const _table2 = (
      <div style={{height:420}}>
            {/* 1.table1 */}
            <div style={{height:'100%',width: '49%',float:'left'}}>
              <table style={{marginTop: 0.1,textAlign:'center', height:'100%',width:'100%'}}>
                {tableThead}
                <tbody>
                {code}
                </tbody>
              </table>
            </div>
            {/* 2.中间线 */}
            <div style={{height:'100%',width:1, marginTop:5,marginRight:10,float:'left',background:'#000'}}></div>
            {/* 3.table2 */}
            <div style={{height:'100%',width:'50%', float:'left'}}>
              <table style={{marginTop: 0.1,textAlign:'center', height:'100%', width:'100%'}}>
                {tableThead}
                <tbody>
                {code2}
                </tbody>
              </table>
            </div>
      </div>
    );
    const _table1 = (
      <div style={{height:420}}>
          <table style={{marginTop: 0.1,textAlign:'center', height:'100%',width:'100%'}}>
            {tableThead}
            <tbody>
            {code}
            </tbody>
          </table>
      </div>
    );

    return (
      <div>
        <ModalA
          width={1200}
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={title}
          visible={visible}
          okText="确定"
          cancelText="取消"
          maskClosable
          footer={null}
          onOk={this.onOk.bind(this, {data: selectedRowKeys } )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >
          { _data}
          {dataSource.length > 16 ? _table2 : _table1}
          <div style={{fontSize:15}}>
            <Divider style={{marginTop:10, marginBottom:5}} />
            <Row>
              <Col span={6}><span>开单医生:&nbsp;{data.applyDoctorName}</span></Col>
              <Col span={6}><span>检验者:&nbsp;{data.testDoctorName} </span> </Col>
              <Col span={6}><span>审核者:&nbsp;{data.auditDoctorName} </span> </Col>
            </Row>
            <Row>
              <Col span={6}><span>送检时间:&nbsp;{moment(data.createTime).format("YYYY-MM-DD HH:mm:ss")} </span></Col>
              <Col span={6}><span>报告时间:&nbsp;{moment(data.testTime).format("YYYY-MM-DD HH:mm:ss")} </span></Col>
            </Row>
            <Row>
              <Col span={12}><span>申请项目:&nbsp;{data.doctorAdviceName} </span></Col>
            </Row>
            <p style={{paddingBottom: 10}}>注:&nbsp;此结果仅符合于本次测试标本</p>
          </div>
        </ModalA>
      </div>
    )
  }
}

ViewReportModal.propTypes = {
  data: PropTypes.any,
  rowKey: PropTypes.string,
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
  prefix: PropTypes.string.isRequired
};

ViewReportModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

ViewReportModal = Form.create()(ViewReportModal);

export default ViewReportModal;
