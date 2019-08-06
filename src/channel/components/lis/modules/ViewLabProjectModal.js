/**
 * Created by jpt on 2018/5/14 0014.
 */
/**
 * Created by jpt on 2018/5/14 0014.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form, Select, Upload, Icon, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message,Radio, Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {searchTextByValues}  from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {dimsMap} from '../../helpers/'
import './customTable.less'
const {custom: {sex}} = dimsMap;

function noop(){}

//-------------------------- 动态表的字段名 -----------------------------------------------
const ROW_DIMS = ["ageMax", "ageMin", 'ageUnit', "sex", "maxValue", "minValue", 'referenceValue','unit', 'deviceTypeId','linearMin','linearMax','type','optionalValue'];
function generateRowOject(){ //1.产生行对象。
  let rowObject = {};
  ROW_DIMS.forEach((key)=>{
    rowObject[key] = undefined
  })
  return rowObject
}
function generateRows(rowNumber){ //2.存储行。
  const _rows = []
  for(let i=0; i<rowNumber; i++){
    _rows.push(generateRowOject())
  }
  return _rows
}

/**
 * 查看项目详细 model。
 *
 * */
class ViewLabProjectModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      samples: [ generateRows(1) ],
      confirmLoading: false,
      devicesType: [],  //仪器类型
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState()
  }

  componentWillReceiveProps(nextProps){ //当组件传入的 props变化时调用，更新state。
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData){
      //console.log("newData内容:",newData );
      const { id, samples=[], devicesType=[],} = newData;
      if(id){
        this.setState({
          samples: [...samples],
          devicesType: devicesType,
        });
      }
    }
  }

  //保存
  onOk = ( )=> {};
  onCancel = ()=> {
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields();
  };
//-------------------------------------------------------------------

//-------------------- 获取动态表数据，重组数据结构。-------------------------------
  generateSamplesArray = (values)=>{
    const _values = values || this.props.form.getFieldsValue();
    const {samples = []} = this.state;
    let arrSample = [];
    for (let i=0; i<samples.length; i++){
      let  _row = {};    //每一行的数据对象。
      ROW_DIMS.map((key)=> {
        _row[key] = _values[`${key}${i}`]  //遍历每一行的数据。 key数组中的元素
      })
      arrSample.push(_row);
    }
    return arrSample;
  }
  remove = (k, rowIdnex) => { //k对象， samples数组， rowIdnex选中数组下标，
    const samples = this.generateSamplesArray();
    let _samples =[];
    if(samples.length < 2 ){  _samples = samples;
    }else{  _samples = samples.filter((_row, i)=>{return rowIdnex !== i}); //保留未被选中的行。
    }

    let _values = {};
    _samples.forEach((_row, i)=>{
      ROW_DIMS.forEach((dimsKey)=>{
        _values[`${dimsKey}${i}`] = _row[dimsKey]
      })
    });
    this.state.samples = _samples;
    this.props.form.setFieldsValue(_values);
  }
  /** 1.动态增加 **/
  addk = () => {
    const {samples = [] } = this.state;
    console.log('---增加--',samples);
    this.setState({
      samples: [...samples].concat(generateRows(1)) //每点击一次，数组合并。
    })
  }

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
    if(isNaN(value) ){
      callback('请输入数值！');
      return ;
    }else{
      callback();
      return ;
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
  /** 6.文件大小限制 **/
  fileLimate =(file)=>{
    //console.log("文件",file);
    if(file.size > 1024*1024*8){
      message.warn("上传文件大小不能大于8M！");
      return  false;
    }
    return true;
  }

  /** 1.设备类型  **/
  deviceName =(deviceId)=> {
    const {devicesType } = this.state;
    let deviceName = '';
    devicesType.map((item)=>{
      if( deviceId === item.id ){
        deviceName =item.nameCn;
        return;
      }
    });
    return deviceName;
  }

  /** 2.1 字典表的模块类型  **/
  matchDictionaryList2 = (type, value)=>{
    //console.log('模块:', type, " value：",value);
    let moduleType =[], name ='';
    moduleType = searchTextByValues(type);
    if(typeof moduleType === 'object'){
      moduleType.map((item)=>{
        if(item.value === value) { //匹配
          return  name= item.text;
        }
      })
    }
    return name;
  }

  /** 2.2 字典表的模块类型  **/
  matchDictionaryList = (type, value)=>{
    let moduleType = searchTextByValues(type);
    return (
      moduleType instanceof Array ?
        moduleType.map((item)=>{
          if(item.value === value) { //匹配
            return  item.text;
          }
        })
       : ''
    )
  }

  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const { samples= [],confirmLoading, } = this.state;

    //console.log("data数据",data )
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
    };
    const _rowSpan = {
      labelSpan: 4,
      wrapperSpan: 6
    };

    const tableCls = cx({
      [`${prefix}-custom-table`]: true
    });
    const inlineTableCls = cx({
      [`inline-table`]: true
    });
    const titleStyle1 = {width:100, background:'#E3F4FF',marginLeft:10};
    const titleStyle2 = {background:'#E3F4FF'};
    const titleStyle3 = {width:200,background:'#E3F4FF'};
    const inlineTrCls = cx({
      [`inline-tr`]: true,
    });
    //-------------------------类型id匹配仪器名称---------------------------


    //---------------------------动态表-------------------------------------
    const _tr = samples.map((k,index) => { //k数组中的元素  index数组下标。
      return ( <tr key={index}>
        <td><div className={`${inlineTrCls}`}>{this.deviceName(k.deviceTypeId)} </div></td>
        <td><div className={`${inlineTrCls}`}>{k.linearMin}- {k.linearMax}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.type && this.matchDictionaryList('project_detail_type', k.type)}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.ageMin}-{k.ageMax} &emsp;{k.ageUnit && this.matchDictionaryList('age_unit', k.ageUnit)}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.sex && this.matchDictionaryList('sex', k.sex)}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.minValue}- {k.maxValue}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.referenceValue}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.unit}</div></td>
        <td><div className={`${inlineTrCls}`}>{k.optionalValue}</div></td>
      </tr> );
    });

    //----------------------- 动态参数 --------------------------------------------------------
    const {Parameters, } = data;
    //console.log('data',data);


    const _table = (
      <div>
        <table className={tableCls}>
          <tBody>
          {/*-------------------添加项目---------------------*/}
          <tr>
            <td style={titleStyle1}>项目</td>
            <td colSpan={6}>
              <table className={inlineTableCls}>
                <tr>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>中文名称</div></td>
                  <td><div className={`${inlineTrCls}`}>{data.nameCn} </div></td>
                </tr>
                <tr>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>英文名称 </div></td>
                  <td><div className={`${inlineTrCls}`}>{data.nameEn} </div></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style={titleStyle1}>临床应用</td>
            <td colSpan={6}>
              <div className={`${inlineTrCls}`}> {data.remark} </div>
            </td>
          </tr>

          <tr>
            <td style={titleStyle1}>项目详细</td>
            <td colSpan={6}>
              <table className={inlineTableCls}>
                <tr>
                  <td style={titleStyle3}><div className={`${inlineTrCls}`}>仪器</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>仪器线性范围</div></td>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>项目类型</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>年龄范围</div></td>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>性别    </div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>参考值范围</div></td>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>标准参考值</div></td>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>单位</div></td>
                  <td style={titleStyle3}><div className={`${inlineTrCls}`}>可选值</div></td>
                </tr>
                {_tr}
              </table>
            </td>
          </tr>

          </tBody>
        </table>
      </div>
    );

    return (
      <ModalA
        width={1200}
        confirmLoading={confirmLoading}
        title={title}
        visible={visible}
        cancelText="取消"
        onCancel={this.onCancel}
        {...props}
      >
        <h2 style={{textAlign: 'center'}}>项目详细</h2>
        <span style={{fontSize:16}}>项目编号 : {`${data.id}`} </span>
        {_table}
      </ModalA>
    )
  }
}

ViewLabProjectModal.propTypes = {
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

ViewLabProjectModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

ViewLabProjectModal = Form.create()(ViewLabProjectModal);

export default ViewLabProjectModal;
