/**
 * Created by jpt on 2018/5/21 0021.
 */
import React, { Component,  } from 'react';   //PropTypes
import PropTypes from 'prop-types';
import {Form, Select, Upload, Tooltip, Icon, Cascader, Input, DatePicker, Alert,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
//import {fetch, CONFIG} from '../../../../services/'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, } from '../../../../compoents2/';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import './customTable.less'

function noop(){}
//-------------------------- 动态表的字段名 -----------------------------------------------
const ROW_DIMS = ["code", "type", "attchFile", "Time"];
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
 * 新增子机构对话框。
 */
class AddSubOrgModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      samples: [ generateRows(1)],                  //动态表
      source:[],
      confirmLoading: false,
    }
  };
  constructor(props){
    super(props);
    this.state = this._retInitialState();
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
        ['country','province','city', 'zone','county'].forEach( (key)=>{
          if(newData[key] !== null){
            arrResidence.push(  parseInt( newData[key])  );
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
      console.log('新建申请单:', data );

      let basic= {}, Paths= {}, arrSample =[],passports=[];
      // case.1.基本数据。
      ['id','code', 'name','passport','erpType', 'erpAccount','erpPassword','parentId'].forEach((key)=>{
        basic[key] = data[key];  //js语法：塞入新属性。
      });
      ['country','province','city','area'].forEach((key, index) =>{
        Paths[key] = data.residence[index];
      });
      // case.2.动态表数据。
      arrSample = this.generateSamplesArray(data);
      arrSample.map((key, index) =>{
        let row={};
        ['type','code','attchFile','beginDate','endDate'].map((item)=>{
          if(item === 'attchFile'){
            row.attchFile = key[item][0]; //文件包裹了两层
          }
          else if(item ==='beginDate'||item ==='endDate'){
            row.beginDate = key.Time[0].unix()*1000;
            row.endDate   = key.Time[1].unix()*1000;
          }else{
            row[item] = key[item];
          }
        })
        passports.push(row);
      });

      let fpData = {
        ...basic,
        ...Paths,
        passports: passports,
      };

      console.log('提交数据:', fpData );
      fetch('org/save', {
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

  //-------------------- 获取动态表数据，重组数据结构。----------------------------
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
    //console.log('---增加--',samples);
    this.setState({
      samples: [...samples].concat(generateRows(1)) //每点击一次，数组合并。
    })
  }
  //------------------------------------------------------------------------------


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

  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }

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
      return;
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


  render(){
    const { samples =[], arrTime=[], arrResidence = [], }= this.state;
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading} = this.state;
    //console.log("——data数据",data)

    //----------------------- 动态参数 ----------------------------------------
    let documentType = [];
    documentType = searchTextByValues('document_type');//模块名称---匹配字典表。
    /*--------- 遍历 证件类型 -----------*/
    const _Select1 = documentType.map((k)=>{
      return ( <Select.Option value={k.value} key={k.id}>{k.text}</Select.Option>  );
    });

    const formItemLayout2 = {
      labelCol: {span: 3, },
      wrapperCol: {span: 20, }
    };
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };


    const tableCls = cx({
      [`${prefix}-custom-table`]: true
    });
    const inlineTableCls = cx({
      [`inline-table`]: true
    });
    const sign = {color:'#f00',fontfamily:'微软雅黑',fontSize:'16px',};
    const titleStyle2 = {background:'#fafafa'};
    const inlineTrCls = cx({
      [`inline-tr`]: true,
    });
    //---------------------------动态表-------------------------------------
    const _tr = samples.map((k,index) => { //k数组中的元素  index数组下标。
      return ( <tr key={index}>
        <td>
          <Form.Item  key={k}>
            {getFieldDecorator(`code${index}`,{
              initialValue: k['code'],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: true, message:"请选择证件类型"},
              ],
            })(
              <Select
                size="large"
                style={{width: 200, marginRight: 2 }}
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
                {_Select1}
              </Select>
            )}
          </Form.Item>
        </td>

        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`type${index}`,{
              initialValue: k['type'],//
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: true, message:"请输证件编号"},
                {validator: this.disabledNameLength }
              ],
            })(
              <Input style={{width: '90%',marginLeft:2 }} />
            )}
          </Form.Item>
        </td>

        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`attchFile${index}`,{
              initialValue: k['attchFile'],//
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })(
              <Upload name="fileUpdate" action="http://device.joinstar.cn/api/device/upload"
                //action="http://localhost:8080/rest?method=ciq.attfile.upload"    //listType="picture"
              >
                <Button>
                  <Icon type="upload" /> 上传
                </Button>
              </Upload>
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`Time${index}`,{
              initialValue: k['Time'],//
              rules: [{required: true,  message:'请选择时间效期' },]
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
          </Form.Item>
        </td>

        <td>
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            //disabled={samples.length < 2 }
            onClick={() => this.remove(k, index)}
          />
        </td>
      </tr> );
    });
    /* 动态表创建 */
    const _table = (
      <div>
        <table className={tableCls}>
          <tbody>
          <tr>
            <td>
              <table className={inlineTableCls}>
                <tbody>
                <tr>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>证件类型</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>证件编号</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>证件文件</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>时间效期</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>操作</div></td>
                </tr>
                {_tr}
                <tr>
                  <td>
                    <Button onClick={this.addk} style={{ width:100, marginLeft:10,marginTop:10, marginBottom:10,}}>
                      <Icon type="plus" />
                    </Button>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    );

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
        {/*-----基础字段-------*/}
        <Form layout='horizontal'>
          <Row>
            <Col span={12} offset={0}><Form.Item
              {...formItemLayout}
              style={{display: 'none'}}
            >
              {getFieldDecorator('id', {  //自己的id
                initialValue: data.id,
                rules: false
              })(
                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                />
              )}
            </Form.Item></Col>
            <Col span={12}><Form.Item
              {...formItemLayout}
              style={{display: 'none'}}
            >
              {getFieldDecorator('parentId', {  //父级id
                initialValue: data.parentId,
                rules: false
              })(
                <Input type="hidden"
                />
              )}
            </Form.Item></Col>
          </Row>

          {/*机构编号 */}
          <Row>
            <Col span={24} offset={0}><Form.Item
              {...formItemLayout2}
              label="机构编号"
              //hasFeedback
            >
              {getFieldDecorator('code', {
                initialValue: data.code,
                rules: [{
                  required: true, message: '请填写机构编号',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '85%', marginRight: '3%' }}
                  placeholder={`请输入机构编号`} />
              )}
            </Form.Item></Col>
          </Row>

          {/*设备类型、机构名称、所在地*/}
          <Row>{/*
           <Col span={12}><Form.Item
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
           </Form.Item></Col>*/}
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="机构名称"
              //hasFeedback
            >
              {getFieldDecorator('name', {
                initialValue: data.name,
                rules: [{
                  required: true, message: '请输入机构名称',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入机构名称`}/>
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

          {/*证件号、地址*/}
          <Row>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="证件号"
              //hasFeedbac
            >
              {getFieldDecorator('passport', {
                initialValue: data.passport,
                rules: [{
                  required: true, message: '请填写证监号',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入证件号`}/>
              )}
            </Form.Item></Col>

            <Col span={12}><Form.Item
              {...formItemLayout}
              label="详细地址"
              //hasFeedback
            >
              {getFieldDecorator('Address', {
                initialValue: data.Address,
                rules: [{
                  required: false, message: '请填写详细地址',
                }]
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入精确地址`}/>
              )}
            </Form.Item></Col>
          </Row>

          {/* Erp类型*/}
          <Row>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="Erp类型"
            >
              {getFieldDecorator('erpType', {
                initialValue: data.erpType,
                rules: [{ required: false,  message: '请选Erp类型!' }],
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
                  <Select.Option value={1} key={1}>{1}</Select.Option>
                </Select>
              )}
            </Form.Item></Col>
          </Row>

          {/* erp账号、erp密码*/}
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
              label="erp账号"
            >
              {getFieldDecorator('erpAccount', {
                initialValue: data.erpAccount,
                rules: [{ required: false,  message: '请填写erp账号!' }],
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入设备编号`} />
              )}
            </Form.Item></Col>
            <Col span={12}><Form.Item
              {...formItemLayout}
              label="erp密码"
              //hasFeedback
            >
              {getFieldDecorator('erpPassword', {
                initialValue: data.erpPassword,
                rules: [
                  { required: false, message: '请填写' },
                ]
              })(
                <Input
                  size="large"
                  style={{ width: '75%', marginRight: '3%' }}
                  placeholder={`请输入设备编号`} />
              )}
            </Form.Item></Col>
          </Row>
        </Form>

        {/*-----动态表-------*/}
        <div style={{marginTop:10}}>
          <Alert message="证件" type="info" />
          {_table}
        </div>
      </ModalA>
    )
  }
}

AddSubOrgModal.propTypes = {
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

AddSubOrgModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

AddSubOrgModal = Form.create()(AddSubOrgModal);

export default AddSubOrgModal;
