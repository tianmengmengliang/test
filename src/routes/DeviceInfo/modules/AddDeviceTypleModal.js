import React, { Component,  } from 'react';   //PropTypes
import PropTypes from 'prop-types';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
//import {fetch, CONFIG} from '../../../../services/'
import fetch from '../../../services/request.js'
import {ModalA, GridTable,ButtonContainer, AddButton, } from    '../../../compoents2/';
//import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from 'antd/../../src/components2/'
//import {dimsMap} from '../../helpers/'
//import './customTable.less'


//const {custom: {entryExit}} = dimsMap;
function noop(){}


class AddDeviceTypleModal extends Component{
    _retInitialState= ()=>{ //用于状态的重置。
        return {
            source:[],
            confirmLoading: false,
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
          const { userId,} = newData;
          if( userId ){
            this.setState({

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
    onOk = ( )=> {
      this.props.form.validateFieldsAndScroll((err, data) => { //数据。
        if (err) {
           message.error(err.message || '未填写完整，请完善后再提交')
          return;
        }
        //console.log('新建申请单:', data );
        let fpData = {};
        ['id','nameEn','nameCn','descInfo','vendor','registNo','price'].forEach((key)=>{
          if(key === 'price'){
            fpData[key] = parseInt(data[key]); //转int
          }
          fpData[key] = data[key];
        });

         console.log('添加设备类型:', fpData );
         fetch('api/device/deviceTypeSave', {
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
    /** 4.验证文件上传不能为空  **/
    disabledNull =(rule, value, callback)=>{
      if(value === null ||value === ''){
          callback(`请下载样表，填写后转PDF格式上传`);
          return ;
      }else{
        callback();
      }
    }
    /** 5.验证字符串长度
    disabledLength2 =(rule, value, callback)=>{
      const _reg = /^\s*\S((.){0,400}\S)?\s*$/;
      if(_reg.test( value) ){
        callback();
        return ;
      }else{
        callback(`限制少于400字!`);
      }
    } **/

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
        const { samples=[], shippingDate=[],source=[],}=this.state;
        const {prefix, title, visible, data = {}, ...props} = this.props;

        const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
        const {confirmLoading} = this.state;
        //console.log("——data数据",data )

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
        const sign = {color:'#f00',fontfamily:'微软雅黑',fontSize:'16px',};

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
                <h2 style={{textAlign: 'center'}}>设备类型录入</h2>

                <Form layout="horizontal" >
                      <Form.Item
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
                      </Form.Item>
                      <Form.Item
                          label="设备类型中文全称"
                          {...formItemLayout}
                          >
                          {getFieldDecorator('nameCn', {
                            initialValue: data.nameCn,
                            rules: [{required: true,  message:'请输入设备类型中文全称' },]
                          })(
                            <Input
                              style={{width: 400}}
                              placeholder={`请输入中文全称`}
                            />
                          )}
                      </Form.Item>
                      <Form.Item
                          {...formItemLayout}
                          label="设备类型英文简称"
                          //hasFeedback
                      >
                          {getFieldDecorator('nameEn', {
                            initialValue: data.nameEn,
                            rules: [{
                              required: true, message: '请输入英文简称',
                            }]
                          })(
                            <Input
                              style={{width: 400}}
                              placeholder={`请输入英文简称`}/>
                          )}
                      </Form.Item>
                      <Form.Item
                          label="设备的描述"
                          required
                          {...formItemLayout}>
                          {getFieldDecorator('descInfo', {
                            initialValue: data.descInfo,
                            rules: [
                              { required: true, message: '请输入设备描述' }
                            ],
                          })(
                            <Input
                              style={{width: 400}}
                              placeholder="请输入描述"
                            />
                          )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="设备厂商"
                        //hasFeedback
                      >
                        {getFieldDecorator('vendor', {
                          initialValue: data.vendor,
                          rules: [{
                            required: true, message: '请输入设备厂商',
                          }]
                        })(
                          <Input
                            style={{width: 400}}
                            placeholder={`请输入企业名称`}/>
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="医疗器械注册证标号"
                        //hasFeedback
                      >
                        {getFieldDecorator('registNo', {
                          initialValue: data.registNo,
                          rules: [{
                            required: true, message: '请输入注册证标号',
                          }]
                        })(
                          <Input
                            style={{width: 400}}
                            placeholder={`请输入单位名称`}/>
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="设备价格"
                        //hasFeedback
                      >
                        {getFieldDecorator('price', {
                          initialValue: data.price,
                          rules: [{
                            required: true, message: '请标注设备价格',
                          }]
                        })(
                          <Input
                            style={{width: 400}}
                            placeholder={`请输入设备价格`}/>
                        )}
                      </Form.Item>
                  </Form>
            </ModalA>
        )
    }
}

AddDeviceTypleModal.propTypes = {
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

AddDeviceTypleModal.defaultProps = {
    prefix: 'yzh-d',
    visible: false,
    callback: noop,
};

AddDeviceTypleModal = Form.create()(AddDeviceTypleModal);

export default AddDeviceTypleModal;
