/**
 * Created by jpt on 2018/4/3 0003.
 */
import React, { Component,  } from 'react';   //PropTypes
import PropTypes from 'prop-types';
import {Form, Select, Upload, Tooltip, Icon, Cascader, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
//import {fetch, CONFIG} from '../../../../services/'
import fetch from '../../../services/request.js'
import {ModalA, GridTable, ButtonContainer, AddButton, } from    '../../../compoents2/';
//import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from 'antd/../../src/components2/'
//import {dimsMap} from '../../helpers/'
//import './customTable.less'
//const {custom: {entryExit}} = dimsMap;
function noop(){}

/**
 *  poctBox 新设备注册对话框。
 */
class AddPOCTBoxModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      source:[],
      confirmLoading: false,
      parentId: 0,
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
      const { parentId,} = newData;
      if(!!parentId ){
        const arrResidence = [];
        ['country','province','city', 'zone','county'].forEach( (key)=>{
          if(newData[key] !== null){
            arrResidence.push(  parseInt( newData[key])  );
          }
        });

        this.setState({
          arrResidence: arrResidence,
        });
      }
    }
  }

  handleRowUpdated = ({ rowIdx, updated })=> {
    const {listPage} = this.state;
    const {rows} = listPage;
    Object.assign(rows[rowIdx], updated);
    this.setState({
        listPage
    });
  };

  //保存
  onOk = ()=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据。
      if (err) {
        message.error(err.message || '未填写完整，请完善后再提交')
        return;
      }

      let fpData = {};
      ['id','parentId','deviceSn','deviceNo','deviceTypeId','productionTime','productAddress','moduleIndex'].forEach((key, index) =>{
         if(key === 'productionTime') {
            fpData[key] = data[key].unix()*1000
         }else{
            fpData[key] = data[key]; //js优点：强行塞入新的属性。
         }
      });

      fetch('api/device/register', {
        // method: 'post',
        // headers: {},
        data: fpData,
        success: (res)=> {
          message.success('保存成功');
          /* 步骤一、回调父组件callback函数, 隐藏对话框、再次查询列表。*/
          this.props.callback && this.props.callback({
            click: 'ok',
            data: null,
          });
          /* 步骤二、将组件重置到初始状态。*/
          this.setState(this._retInitialState());
          this.props.form.resetFields();
        },
        error: (err)=> {
          message.error('保存数据失败');
        },
        beforeSend: ()=> {
          this.setState({
            confirmLoading: true
          })
        },
        complete: (err, data)=> {
          this.setState({
            confirmLoading: false
          })
        }
      })
    });
  };
  onCancel = ()=> {
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields();
  };
  //-------------------------------------------------------------------

  //----------------- start 查询编号接口 ----------------------------------------------
  //编号查询接口
  getDeviceNoData = (_data={}, callback=()=>{})=>{ //
    fetch('api/device/generateDeviceNo', {
      // method: 'post',
      // headers: {},
      data: _data,
      success: (res)=>{
        console.log("----DeviceNo:----",res);
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
  //查询操作
  selectDeviceNo =()=> {
    this.props.form.validateFieldsAndScroll(['deviceSn','deviceType','imsi'],(err, data) => { //数据。
      if (err) {
        message.error(err.message || '未填写完整，请完善后再提交')
        return;
      }
      //console.log('请求参数:', data);
      this.getDeviceNoData({data}, (err, res)=> { ////五、获取所有专家组
        if(err){
          message.warn(`查询不存在`);//可能。
          return;
        }
        const DeviceNo = res.responseObject;
        //console.log('devicTypeGroup:', DeviceNo);

        //表单联动
        //使用 setFieldsValue 来动态设置其他控件的值。
        this.props.form.setFieldsValue({
          deviceNo: DeviceNo,
        });
      });
    });
  }
  //------------------ end 设备编号查询接口 ----------------------------------------------

  onChange4 = (e) => {
    this.setState({
      item4: e.target.value,
    });
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


  render(){
    const { samples=[], shippingDate=[], }= this.state;
    const {prefix, title, visible, data = {}, ...props} = this.props;

    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading} = this.state;


    const{ devicTypeGroup=[],  } = data;
    /*--------- 遍历所有设备类型 ---------*/
    const _Select = devicTypeGroup.map((k)=>{
       return ( <Select.Option value={k.id} key={k.id}>{k.nameCn}</Select.Option>  );
    });

    const formItemLayout2 = {
      labelCol: {span: 3},
      wrapperCol: {span: 21}
    };
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
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
    const sign = {color:'#f00',fontfamily:'微软雅黑',fontSize:'16px',};

    return (
      <ModalA
        width={900}
        confirmLoading={confirmLoading}
        title={title}
        visible={visible}
        okText="保存"
        cancelText="取消"
        onOk={this.onOk}           //保存按钮。
        onCancel={this.onCancel}
        bodyHeight={500}
        {...props}
      >
        <Form layout='horizontal'>
          <Row>
            <Col span={24} offset={0}><Form.Item
              {...formItemLayout}
              style={{display: 'none'}}
            >
              {getFieldDecorator('id', {  //申请类别(1,2,3)
                initialValue: data.id,
                rules: false
              })(
                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                />
              )}
            </Form.Item></Col>
          </Row>
          <Row>
            <Col span={24} offset={0}><Form.Item
              {...formItemLayout}
              style={{display: 'none'}}
            >
              {getFieldDecorator('parentId', {  //添加模块是必须要加parentId
                initialValue: data.parentId,
                rules: false
              })(
                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                />
              )}
            </Form.Item></Col>
          </Row>

          {/*1.设备串号*/}
          <Row>
            <Col span={24} offset={0}><Form.Item
              {...formItemLayout2}
              label="模块设备串号"
              //hasFeedback
            >
              {getFieldDecorator('deviceSn', {
                initialValue: data.deviceSn,
                rules: [{
                  required: true, message: '请填写设备串号',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '85%', marginRight: '3%' }}
                  placeholder={`请输入设备串号`} />
              )}
            </Form.Item></Col>
          </Row>

          {/*2.模块类型、放置位置号*/}
          <Row>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="模块类型"
              //hasFeedback
            >
              {getFieldDecorator('deviceTypeId', {
                initialValue: data.deviceTypeId,
                rules: [{
                  required: true, message: '请输入设备类型',
                }]
              })(
                <Select
                  size="large"
                  style={{width: '75%', marginRight: '3%' }}
                  placeholder={`请输入单位名称`}
                  //allowClear={true}
                  multiple={false}
                  combobox={false}
                  tags={false}
                  showSearch={false}
                  filterOption={false}
                  optionFilterProp={`children`}
                  labelInValue={false}
                  tokenSeparators={null}
                  getPopupContainer={this.getPopup} //菜单定位问题
                  //onChange={this.onSelectChange}
                >
                  {_Select}
                </Select>
              )}
            </Form.Item></Col>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="放置位置"
              //hasFeedback
            >
              {getFieldDecorator('moduleIndex', {
                initialValue: data.moduleIndex,
                rules: [{
                  required: true, message: '请选位置',
                }]
              })(
                <Select
                  size="large"
                  style={{width: '55%', marginRight: '3%' }}
                  placeholder={`请放置位置号`}
                  //allowClear={true}
                  multiple={false}
                  combobox={false}
                  tags={false}
                  showSearch={false}
                  filterOption={false}
                  optionFilterProp={`children`}
                  labelInValue={false}
                  tokenSeparators={null}
                  getPopupContainer={this.getPopup} //菜单定位问题
                  onChange={this.onSelectChange}
                >
                  <Select.Option value={1} key={1}>{'01'}</Select.Option>
                  <Select.Option value={2} key={2}>{'02'}</Select.Option>
                  <Select.Option value={3} key={3}>{'03'}</Select.Option>
                  <Select.Option value={4} key={4}>{'04'}</Select.Option>
                </Select>
              )}
            </Form.Item></Col>
          </Row>

          {/*3.设备编号 */}
          <Row>
            {/*<Col span={12}><Form.Item
             {...formItemLayout}
             label="设备编号"
             extra="请先填写设备串号,类型,SIM卡后，再获取编号!"
             >
             <Row gutter={8}>
             <Col span={12}>
             {getFieldDecorator('deviceNo', {
             initialValue: data.deviceNo,
             rules: [{ required: true,  message: '请查询设备编号!' }],
             })(
             <Input
             size="large"
             style={{ width: '100%', marginRight: '3%' }}
             placeholder={`请输入设备编号`} />
             )}
             </Col>
             <Col span={12}>
             <Button onClick={this.selectDeviceNo.bind(this, {})} type="primary">获取编号</Button>
             </Col>
             </Row>
             </Form.Item></Col>*/}
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="模块设备编号"
            >
              {getFieldDecorator('deviceNo', {
                initialValue: data.deviceNo,
                rules: [{ required: true,  message: '请查询设备编号!' }],
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入设备编号`} />
              )}
            </Form.Item></Col>
          </Row>

          {/*4.生产时间*/}
          <Row>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="模块生产时间"
              //hasFeedback
            >
              {getFieldDecorator('productionTime', {
                initialValue: data.productionTime ? moment(data.productionTime): undefined,
                rules: [
                  { required: true, message: '请选择日期' },
                ]
              })(
                <DatePicker
                  allowClear
                  showTime={false}
                  format="YYYY-MM-DD"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder="请选择日期"/>
              )}
            </Form.Item></Col>
          </Row>

          {/*5.生产地址 */}
          <Row>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="模块出产地址"
              //hasFeedback
            >
              {getFieldDecorator('productAddress', {
                initialValue: data.productAddress,
                rules: [{
                  required: true, message: '请填写生产地址',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入生产地址`}/>
              )}
            </Form.Item></Col>
          </Row>
        </Form>
      </ModalA>
    )
  }
}

AddPOCTBoxModal.propTypes = {
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
  prefix: PropTypes.string.isRequired
};

AddPOCTBoxModal.defaultProps = {
  prefix: 'yzh-d',
  visible: false,
  callback: noop,
};

AddPOCTBoxModal = Form.create()(AddPOCTBoxModal);

export default AddPOCTBoxModal;
