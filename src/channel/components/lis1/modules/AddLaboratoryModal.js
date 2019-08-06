/**
 * Created by jpt on 2018/5/21 0021.
 */
/**
 * Created by jpt on 2018/4/3 0003.
 */
import React, { Component,  } from 'react';   //PropTypes
import PropTypes from 'prop-types';
import {Form, Select, Upload, Tooltip, Icon, Cascader, Input, DatePicker,Alert,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, } from '../../../../compoents2/';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表

//import {dimsMap} from '../../helpers/'
//import './customTable.less'
//const {custom: {entryExit}} = dimsMap;
function noop(){}

/**
 * 创建实验室,对话框。
 */
class AddLaboratoryModal extends Component{
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
      const {id,} = newData;
      if(!!id ){
        let arrTime=[], arrResidence=[] ;
        ['maintenanceStartTime', 'maintenanceEndTime'].forEach( (key)=>{
          arrTime.push(  moment(newData[key])  );
        });
        ['country','province','city', 'area'].forEach( (key)=>{
          if(newData[key] !== null){
            arrResidence.push( newData[key] );
          }
        });

        this.setState({
          arrTime: arrTime,
          arrResidence: arrResidence,
        });
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
      //console.log('新建申请单:', data );
      //*声明容器
      let basic= {}, Paths= {};
      // case.1.基本数据。
      ['id','code', 'name','type','address', 'lat','lng','lisType','lisVersion','lisAccount','lisPassword','orgId'].forEach((key)=>{
        basic[key] = data[key];  //js语法：塞入新属性。
      });
      ['country','province','city','area'].forEach((key, index) =>{
        Paths[key] = data.residence[index];
      });

      var fpData = {
        ...basic,
        ...Paths
      };
      fetch('lab/save', {
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
          message.error(err.message ||'保存数据失败');
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
    const { arrTime=[], arrResidence = [], }= this.state;
    const {prefix, title, visible, data = {}, ...props} = this.props;

    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading} = this.state;
    //console.log("——data数据",data)

    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//即检实验室模块---匹配字典表。
    lisType = searchTextByValues('lis_type');//lis类型模块---匹配字典表。
    /*--------- 遍历类型 ---------*/
    const _Select = labType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });
    const _Select2 = lisType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });

    const formItemLayout2 = {
      labelCol: {span: 3, },
      wrapperCol: {span: 20, }
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
        <div style={{background:'#fafafa'}}>
          <Form layout='horizontal'>
            {/*id、 机构Id */}
            <Row>
              <Col span={12} offset={0}><Form.Item
                {...formItemLayout}
                style={{display: 'none'}}
              >
                {getFieldDecorator('id', {  //申请类别(1,2,3)
                  initialValue: data.id,
                  rules: false
                })(
                  <Input type="hidden" //style={{ width: '65%', marginRight: '3%' }}
                  />
                )}
              </Form.Item></Col>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="所属机构"
                style={{display: 'none'}}
              >
                {getFieldDecorator('orgId', {
                  initialValue: data.orgId,
                  rules: [{
                    required:true, message: '请填写所属机构',
                  }]
                })(
                  <Input type="hidden" //style={{ width: '65%', marginRight: '3%' }}
                  />
                )}
              </Form.Item></Col>
            </Row>

            {/*实验室名称 */}
            <Row>
              <Col span={12} offset={0}><Form.Item
                {...formItemLayout}
                label="实验室名称"
                //hasFeedback
              >
                {getFieldDecorator('name', {
                  initialValue: data.name,
                  rules: [{
                    required: true, message: '请填写实验室名称',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '85%', marginRight: '3%' }}
                    placeholder={`请输入实验室名称`} />
                )}
              </Form.Item></Col>
              <Col span={12} offset={0}><Form.Item
                {...formItemLayout}
                label="实验室编号"
                //hasFeedback
              >
                {getFieldDecorator('code', {
                  initialValue: data.code,
                  rules: [{
                    required: true, message: '请填写编号',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请输入编号`} />
                )}
              </Form.Item></Col>
            </Row>

            {/* 类型、 省市区*/}
            <Row>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="类型"
                //hasFeedback
              >
                {getFieldDecorator('type', {
                  initialValue: data.type,
                  rules: [{
                    required: true, message: '请输入类型',
                  }]
                })(
                  <Select
                    size="large"
                    style={{width: '75%', marginRight: '3%' }}
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
                    getPopupContainer={this.getPopup} //菜单定位问题
                    //onChange={this.onSelectChange}
                  >
                    {_Select}
                  </Select>
                )}
              </Form.Item></Col>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="所在地"
              >
                {getFieldDecorator('residence', {
                  initialValue: arrResidence,
                  rules: [{ type:'array', required: true,  message: '请选择设备所在地' }],
                })(
                  <Cascader options={data.residences}
                            size="large"
                            style={{ width: '75%', marginRight: '3%' }}
                            placeholder={`请选设备所在地`} />
                )}
              </Form.Item></Col>
            </Row>

            {/* orgName、详细地址*/}
            <Row>
              {/*<Col span={12}><Form.Item
                {...formItemLayout}
                label="所属机构"
                //hasFeedbac
              >
                {getFieldDecorator('orgName', {
                  initialValue: data.orgName,
                  rules: [{
                    required: false, message: '请填写所属机构',
                  }]
                })(
                  <Input
                    size="large"
                    disabled={true}
                    style={{ width: '75%', marginRight: '3%', fontSize:16,fontWeight:'bold' }}
                    placeholder={`请输入所属机构`}/>
                )}
              </Form.Item></Col>*/}
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="详细地址"
                //hasFeedback
              >
                {getFieldDecorator('address', {
                  initialValue: data.address,
                  rules: [{
                    required: true, message: '请填写精确地址',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请输入精确地址`}/>
                )}
              </Form.Item></Col>
            </Row>
            {/*经纬度*/}
            <Row>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="经度"
                //hasFeedback
              >
                {getFieldDecorator('lng', {
                  initialValue: data.lng,
                  rules: [{
                    required: true, message: '请填写经度',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请输入经度`}/>
                )}
              </Form.Item></Col>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="纬度"
                //hasFeedbac
              >
                {getFieldDecorator('lat', {
                  initialValue: data.lat,
                  rules: [{
                    required: true, message: '请填写纬度',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请输入纬度`}/>
                )}
              </Form.Item></Col>

            </Row>

            {/* 设备编号查询、生产时间*/}
            {/*<Row>
             <Col span={12}><Form.Item
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
             </Form.Item></Col>
             <Col span={12}><Form.Item
             {...formItemLayout}
             label="生产时间"
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
             </Row>*/}

            {/*Lis类型、Lis版本 */}
            <Row>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="Lis类型"
              >
                {getFieldDecorator('lisType', {
                  initialValue: data.lisType,
                  rules: [{
                    required: true,  message: '请选择Lis类型',
                  }]
                })(
                  <Select
                    size="large"
                    style={{width: '75%', marginRight: '3%' }}
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
                    getPopupContainer={this.getPopup} //菜单定位问题
                    //onChange={this.onSelectChange}
                  >
                    {_Select2}
                  </Select>
                )}
              </Form.Item></Col>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="Lis版本"
                //hasFeedback
              >
                {getFieldDecorator('lisVersion', {
                  initialValue: data.lisVersion,
                  rules: [{
                    required: true, message: '请填写Lis版本',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请输入Lis版本`}/>
                )}
              </Form.Item></Col>
            </Row>

            {/*Lis账号、Lis密码 */}
            <Row>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="Lis账号"
                //hasFeedbac
              >
                {getFieldDecorator('lisAccount', {
                  initialValue: data.lisAccount,
                  rules: [{
                    required: true, message: '请填写实验室编号',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请填写实验室编号`}/>
                )}
              </Form.Item></Col>
              <Col span={12}><Form.Item
                {...formItemLayout}
                label="Lis密码"
                //hasFeedback
              >
                {getFieldDecorator('lisPassword', {
                  initialValue: data.lisPassword,
                  rules: [{
                    required: true, message: '请填写Lis密码',
                  }]
                })(
                  <Input
                    size="large"
                    style={{ width: '75%', marginRight: '3%' }}
                    placeholder={`请输入Lis密码`}/>
                )}
              </Form.Item></Col>
            </Row>
          </Form>
        </div>
      </ModalA>
    )
  }
}

AddLaboratoryModal.propTypes = {
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

AddLaboratoryModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

AddLaboratoryModal = Form.create()(AddLaboratoryModal);

export default AddLaboratoryModal;
