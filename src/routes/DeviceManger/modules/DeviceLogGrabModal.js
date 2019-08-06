/**
 * Created by jpt on 2018/4/17 0017.
 */
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
import fetch from '../../../services/request.js'
import {ModalA, GridTable, ButtonContainer, AddButton, } from    '../../../compoents2/';
function noop(){}

/**
 * 新设备注册对话框。
 */
class DeviceLogGrabModal extends Component{

  _retInitialState= ()=>{ //用于状态的重置。
    return {
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
      const {id,} = newData;
      if(!!id ){

      }
    }
  }

  //保存
  onOk = ()=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据。
      if (err) {
        message.error(err.message || '未填写完整，请完善后再提交')
        return;
      }
      //let Paths = {};
      //['country','province','city','zone'].forEach((key, index) =>{
      //  const fileData = data.residence[index];
      //  Paths[key] = parseInt(fileData); //js优点：强行塞入新的属性。
      //});

      var fpData = {
        //id: data.id,
        deviceNo: data.deviceNo,
        deviceSn: data.deviceSn,
        deviceTypeId:  data.deviceType,
        taskStartTime: data.Time[0].unix()*1000,
        taskEndTime:  data.Time[1].unix()*1000,
      };

      fetch('api/device/logDownloadTaskSave', {
        // method: 'post',
        // headers: {},
        data: fpData,
        success: (res)=> {
          message.success('发送成功');
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
    const {prefix, title, visible, data = {}, ...props} = this.props;

    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading} = this.state;
    //console.log("——传入data数据",data)

    const{ devicTypeGroup=[],  } = data;

    /*--------- 遍历所有设备类型 ---------*/
    const _Select = devicTypeGroup.map((k)=>{
      return ( <Select.Option value={k.id} key={k.id}>{k.nameCn}</Select.Option>  );
    });


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
        width={600}
        confirmLoading={confirmLoading}
        title={title}
        visible={visible}
        okText="发送"
        cancelText="取消"
        onOk={this.onOk}           //保存按钮。
        onCancel={this.onCancel}
        //bodyHeight={500}
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

          {/*设备标识码 */}
          <Row>
            <Col span={24} offset={0}><Form.Item
              {...formItemLayout}
              label="设备标识码"
              //hasFeedback
            >
              {getFieldDecorator('deviceSn', {
                initialValue: data.deviceSn,
                rules: [{
                  required: true, message: '请填写标识码',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入标识码`}
                  disabled={true}/>
              )}
            </Form.Item></Col>
          </Row>

          {/*设备类型 */}
          <Row>
            <Col span={24}><Form.Item
              {...formItemLayout}
              label="设备类型"
              //hasFeedback
            >
              {getFieldDecorator('deviceType', {
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
                  disabled={true}
                >
                  {_Select}
                </Select>
              )}
            </Form.Item></Col>
          </Row>

          {/*设备编号查询 */}
          <Row>
            <Col span={24}><Form.Item
              {...formItemLayout}
              label="设备编号"
            >
              {getFieldDecorator('deviceNo', {
                initialValue: data.deviceNo,
                rules: [{ required: true,  message: '请查询设备编号!' }],
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入设备编号`}
                  disabled={true}/>
              )}
            </Form.Item></Col>
          </Row>

          {/*时间期 */}
          <Row>
            <Col span={24} offset={0}><Form.Item
              label="日志起止时间"
              {...formItemLayout}
            >
              {getFieldDecorator('Time', {
                rules: [{required: true,  message:'请选择起止时间' },]
              })(
                <DatePicker.RangePicker
                  allowClear
                  showTime={false}
                  format={''}
                  ranges={{ '1个月': [moment(), moment().add(1, 'M')], '2个月': [moment(), moment().add(2, 'M')], '3个月': [moment(), moment().add(3, 'M')] }}
                  format="YYYY-MM-DD"
                  //disabledDate={this.disabledDate }  已过日期不可选。
                />
              )}
            </Form.Item></Col>
          </Row>
        </Form>
      </ModalA>
    )
  }
}

DeviceLogGrabModal.propTypes = {
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

DeviceLogGrabModal.defaultProps = {
  prefix: 'yzh-d',
  visible: false,
  callback: noop,
};

DeviceLogGrabModal = Form.create()(DeviceLogGrabModal);

export default DeviceLogGrabModal;
