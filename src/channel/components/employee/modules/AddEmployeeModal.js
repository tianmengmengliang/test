/**
 * Created by jpt on 2018/5/14 0014.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Row, Col,Form, Card, Table,Tabs, Button, Radio, Input, message, Popconfirm,  Divider,
    Checkbox,Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {dimsMap} from '../../helpers/'
import './customTable.less'
const {custom: {sex}} = dimsMap;
function noop(){}


class AddEmployeeModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      samples: [],
      confirmLoading: false,

      employeeFlag: 0,     //标志位，
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
      console.log('--componentWillReceiveProps时期:', newData);
      const {id, } = newData;
      if(id){
        this.setState({
          samples: [ ],
        });
      }
    }
  }

  //保存
  onOk = ()=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据。
      //console.log('保存单步骤-:', data );
      if (err) {
        message.error(err.message || '订单填写未完整，请完善后再提交')
        return;
      }
      var fpData = {
        ...data
      };

     /* ['code',"name", 'orgId','departmentId','employeeFlag','username','password','roleId','mobile','qq','email'].forEach((key)=>{
          fpData[key] = data[key]; //js语法：塞入新属性。
      });*/

      console.log('保存申请单步骤二:', fpData );
      fetch('employee/save', {
        // method: 'post',
        // headers: {},
        data: fpData,
        success: (res)=> {
          message.success(`保存成功`);
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

  /*
   * @interface 点击tabPane的回调
   * @param {string} 点击的tabPane的key
   * */
  onRadioClick = (e)=>{
    this.setState({
      employeeFlag: e.target.value,
    })
  };

  render(){
    const { samples =[], shippingDate=[],}=this.state;
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading, employeeFlag, } = this.state;

    //console.log("data数据",data )
    //----------------------- 动态参数 ----------------------------------------
    const {orgIdType =[{id:1, text:'机构1', value: '1'}],
      departmentIdType =[{id:1, text:'部门1', value: '1'}],
      roleIdType =[{id:1, text:'角色1', value: '1'}], } = data;
    /*--------- 遍历 orgId  -----------*/
    const _Select1 = orgIdType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });
    /*--------- 遍历 departmentId -----------*/
    const _Select2 = departmentIdType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });
    /*--------- 遍历 roleId -----------*/
    const _Select3 = roleIdType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });

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
    const inlineTrCls = cx({
      [`inline-tr`]: true,
    });


    return (
      <ModalA
        confirmLoading={confirmLoading}
        title={title}
        visible={visible}
        okText="保存"
        cancelText="取消"
        onOk={this.onOk}           //保存按钮。
        onCancel={this.onCancel}
        // bodyHeight={500}
        {...props}
      >
        <Form layout="horizontal" >
          <Form.Item
            {...formItemLayout}
            style={{display: 'none'}}
          >
            {getFieldDecorator('id', {
              initialValue: data.id,
              rules: false
            })(
              <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
              />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="用户标志"
          >
            {getFieldDecorator('employeeFlag',{
              initialValue: data.employeeFlag,
            })(
              <RadioGroup onChange={this.onRadioClick}>
                <RadioButton value={0}>普通用户</RadioButton>
                <RadioButton value={1}>开户用户</RadioButton>
              </RadioGroup>
            )}
          </Form.Item>
          <Form.Item
            label="员工工号"
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              initialValue: data.code,
              rules: [{required: true,  message:'请输入全称' },]
            })(
              <Input
                style={{width: 400}}
                placeholder={`请输入中文全称`}
              />
            )}
          </Form.Item>
          <Form.Item
            label="姓名"
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              initialValue: data.name,
              rules: [{required: true,  message:'请输入全称姓名' },]
            })(
              <Input
                style={{width: 400}}
                placeholder={`请输入中文姓名`}
              />
            )}
          </Form.Item>

          <Form.Item
            {...formItemLayout}
            label="机构id"
            //hasFeedback
          >
            {getFieldDecorator('orgId', {
              initialValue: data.orgId,
              rules: [{
                required: true, message: '请输入机构id',
              }]
            })(
              <Select
                size="large"
                style={{width: 200, marginRight: '3%' }}
                placeholder={`请选择`}
                //allowClear={true}
                multiple={false}
                combobox={false}
                tags={false}
                showSearch={false}
                filterOption={false}
                optionFilterProp={`children`}
                labelInValue={false}
                tokenSeparators={null}
                //getPopupContainer={this.getPopup} //菜单定位问题
              >
                {_Select1}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label="所属部门"
            required
            {...formItemLayout}>
            {getFieldDecorator('departmentId', {
              initialValue: data.departmentId,
              rules: [
                { required: true, message: '请输入所属部门' }
              ],
            })(
              <Select
                size="large"
                style={{width: 200, marginRight: '3%' }}
                placeholder={`请选择`}
                //allowClear={true}
                multiple={false}
                combobox={false}
                tags={false}
                showSearch={false}
                filterOption={false}
                optionFilterProp={`children`}
                labelInValue={false}
                tokenSeparators={null}
                //getPopupContainer={this.getPopup} //菜单定位问题
              >
                {_Select2}
              </Select>
            )}
          </Form.Item>

          {employeeFlag === 1 ?  //开户用户
            <div>
              <Form.Item
                {...formItemLayout}
                label="用户名"
                //hasFeedback
              >
                {getFieldDecorator('username', {
                  initialValue: data.username,
                  rules: [{
                    required: true, message: '请输入用户名',
                  }]
                })(
                  <Input
                    style={{width: 400}}
                    placeholder={`请输入用户名`}/>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="密码"
                //hasFeedback
              >
                {getFieldDecorator('password', {
                  initialValue: data.password,
                  rules: [{
                    required: true, message: '请输入密码',
                  }]
                })(
                  <Input
                    style={{width: 400}}
                    placeholder={`请输入密码`}/>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="角色"
                //hasFeedback
              >
                {getFieldDecorator('roleId', {
                  initialValue: data.roleId,
                  rules: [{
                    required: true, message: '请选择角色',
                  }]
                })(
                  <Select
                    size="large"
                    style={{width: 200, marginRight: '3%' }}
                    placeholder={`请选择`}
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
                    {_Select3}
                  </Select>
                )}
              </Form.Item>

              <Form.Item
                {...formItemLayout}
                label="手机号"
                //hasFeedback
              >
                {getFieldDecorator('mobile', {
                  initialValue: data.roleId,
                  rules: [{
                    required: true, message: '请选择角色',
                  }]
                })(
                  <Input
                    style={{width: 400}}
                    placeholder={`请输入角色`}/>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="QQ"
                //hasFeedback
              >
                {getFieldDecorator('qq', {
                  initialValue: data.qq,
                  rules: [{
                    required: true, message: '请选择角色',
                  }]
                })(
                  <Input
                    style={{width: 400}}
                    placeholder={`请输入角色`}/>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="邮箱"
                //hasFeedback
              >
                {getFieldDecorator('email', {
                  initialValue: data.email,
                  rules: [{
                    required: true, message: '请选择角色',
                  }]
                })(
                  <Input
                    style={{width: 400}}
                    placeholder={`请输入角色`}/>
                )}
              </Form.Item>
            </div>
            : ''}
        </Form>
      </ModalA>
    )
  }
}

AddEmployeeModal.propTypes = {
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

AddEmployeeModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddEmployeeModal = Form.create()(AddEmployeeModal);

export default AddEmployeeModal;
