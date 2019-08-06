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
import {dimsMap} from '../../helpers/'
import './customTable.less'
const {custom: {sex}} = dimsMap;

function noop(){}

//-------------------------- 动态表的字段名 -----------------------------------------------
const ROW_DIMS = ["ageMax", "ageMin", "sex", "maxValue", "minValue", 'referenceValue'];
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
 * 项目动态表。
 *
 */
class AddLabProjectModal extends Component{
  _retInitialState= ()=>{ //初始状态。
    return {
      samples: [ generateRows(1) ],
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
      console.log('--componentWillReceiveProps时期:', newData);
      const {id, samples= [], } = newData;
      if(id){
        this.setState({
          samples: [...samples],
        });
      }
    }
  }

  //保存
  onOk = ( )=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据。
      //console.log('保存单步骤-:', data );
      if (err) {
        message.error(err.message || '订单填写未完整，请完善后再提交')
        return;
      }

      const arrSample = this.generateSamplesArray(data);
      //json转数值
      let labProjectDetailVos = [];
      arrSample.map((key)=>{
        ["ageMax", "ageMin", "sex", "maxValue", "minValue"].forEach((n, index)=>{//, 'referenceValue'
          key[n] = Number( key[n]);
        });
        labProjectDetailVos.push( key);
      });

      this.setState({
         samples: arrSample,
      })
      var fpData = {
        id: data.id,
        labProjectDetailVos: labProjectDetailVos,  //详细表
      };
      ["nameEn", 'nameCn','medicareCode','shortName','unit','remark'].forEach((key)=>{
          fpData[key] = data[key]; //js语法：塞入新属性。
      });

      console.log('保存申请单步骤二:', fpData );
      fetch('labProject/save', {
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
    console.log('---增加--',samples);
    this.setState({
      samples: [...samples].concat(generateRows(1)) //每点击一次，数组合并。
    })
  }
//------------------------------------------------------------------------------

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


  render(){
    const { samples =[], shippingDate=[],}=this.state;
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
    const {confirmLoading} = this.state;

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
    const inlineTrCls = cx({
      [`inline-tr`]: true,
    });

    //---------------------------动态表-------------------------------------
    //["ageMax", "ageMin", "sex", "maxValue", "minValue", 'referenceValue'];
    const _tr = samples.map((k,index) => { //k数组中的元素  index数组下标。
      return ( <tr key={index}>
        <td>
          <Form.Item  key={k}>
            {getFieldDecorator(`ageMax${index}`,{
              initialValue: k['ageMax'],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required:false, message:"请输数字"},
                {validator:this.disabledNumber }
              ],
            })(
              <Input style={{width: '90%', marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item  key={k}>
            {getFieldDecorator(`ageMin${index}`,{
              initialValue: k['ageMin'],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: false, message:"请输数字"},
                {validator: this.disabledNumber }
              ],
            })(
              <Input  style={{width: '90%', marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td >
          <Form.Item  key={k}>
            {getFieldDecorator(`sex${index}`,{
              initialValue: k['sex'],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [{
                required: false,
                message: "请输入或删除该行",
              }],
            })(
              <Select
                size="large"
                style={{width:130, marginLeft:2}}
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
                <Select.Option value={0} key={0}>不限</Select.Option>
                <Select.Option value={1} key={1}>男</Select.Option>
                <Select.Option value={2} key={2}>女</Select.Option>
              </Select>
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`maxValue${index}`,{
              initialValue: k['maxValue'],//
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: false, message:"请输数字"},
                {validator: this.disabledNumber }
              ],
            })(
              <Input style={{width: '90%',marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`minValue${index}`,{
              initialValue: k['minValue'],//
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: false, message:"请输数字" },
                {validator: this.disabledNumber }
              ],
            })(
              <Input style={{width: '90%',marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`referenceValue${index}`,{
              initialValue: k['referenceValue'],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: false, message:"请输数字" },
              ],
            })(
              <Input style={{width: '90%',marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            disabled={samples.length < 2 }
            onClick={() => this.remove(k, index)}
          />
        </td>
      </tr> );
    });

    //----------------------- 动态参数 --------------------------------------------------------
    const {Parameters, } = data;
    //console.log('data',data);


    const _table = (
      <div>
        <table className={tableCls}>
          <tBody>
          <tr>
            <td style={titleStyle1}>项目详细</td>
            <td colSpan={6}>
              <table className={inlineTableCls}>
                <tr>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>最大年龄</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>最小年龄</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>性别  </div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>最大参考值</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>最小参考值</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>标准参考值</div></td>
                  <td style={titleStyle2}><div className={`${inlineTrCls}`}></div></td>
                </tr>
                {_tr}
                <tr>
                  <td><Button onClick={this.addk} style={{ width:'100px', marginLeft:10,marginTop:10, marginBottom:10,}}>
                    <Icon type="plus" />
                  </Button>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {/* <tr>
            <td style={titleStyle1}>日期 </td>
            <td colSpan={6}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('shippingDate', {
                    initialValue: shippingDate ,
                    rules: [{required:true, message:'请选择起运日期'}, ]
                  })(
                    <DatePicker.RangePicker
                      allowClear
                      showTime={false}
                      format={''}
                      ranges={{ '1个月': [moment(), moment().add(1, 'M')], '2个月': [moment(), moment().add(2, 'M')], '3个月': [moment(), moment().add(3, 'M')] }}
                      format="YYYY-MM-DD"
                      disabledDate={this.disabledDate }  //已过日期不可选。
                      //getCalendarContainer={this.getPopup} //菜单滚动问题。
                    />
                  )}
                </Form.Item>
              </div>
            </td>
          </tr>*/}

          <tr>  {/*-------------------添加项目---------------------*/}
            <td style={titleStyle1}>项目</td>
            <td colSpan={6}>
              <table className={inlineTableCls}>
                <tr>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>中文名称</div></td>
                  <td><div className={`${inlineTrCls}`}>
                    <Form.Item>
                      {getFieldDecorator('nameCn', {
                        initialValue: data.nameCn,
                        rules: [
                          { required: false, message:'请填写中文名称' },
                        ]
                      })(
                        <Input  //style={{ width: 600, marginRight: '3%' }}
                        />
                      )}
                    </Form.Item>
                  </div></td>
                </tr>
                <tr>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>英文名称 </div></td>
                  <td><div className={`${inlineTrCls}`}>
                    <Form.Item>
                      {getFieldDecorator('nameEn', {
                        initialValue: data.nameEn,
                        rules: [
                          { required: false, message:'英文名称' },
                        ]
                      })(
                        <Input //style={{width: 600, marginRight: '3%' }}
                        />
                      )}</Form.Item>
                  </div></td>
                </tr>
                <tr>
                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>简称</div></td>
                  <td><table className={inlineTableCls}>
                    <tr>
                      <td><div className={`${inlineTrCls}`}>
                        <Form.Item>
                          {getFieldDecorator('shortName', {
                            initialValue: data.shortName,
                            rules:[
                              {required: false, message:'请填写简称'},
                              {validator:this.disabledNameLength  }
                            ]
                          })(
                            <Input// style={{ width: '65%', marginRight: '3%' }}
                            />
                          )}</Form.Item>
                      </div></td>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>单位</div></td>
                      <td><div className={`${inlineTrCls}`}>
                        <Form.Item>
                          {getFieldDecorator('unit', {
                            initialValue: data.unit,
                            rules: [{required: false, message:'请填写单位' }]
                          })(
                            <Input// style={{ width: '65%', marginRight: '3%' }}
                            />
                          )}</Form.Item>
                      </div></td>
                    </tr>
                  </table> </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style={titleStyle1}>医保编号</td>
            <td colSpan={6}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('medicareCode', {
                    initialValue: data.medicareCode,
                    rules: [{ required: false, message:'请填写医保编号' },]
                  })(
                    <Input //style={{ width: 600, marginRight: '3%' }}
                    />
                  )}</Form.Item>
              </div>
            </td>
          </tr>

          <tr>
            <td style={titleStyle1}>备注</td>
            <td colSpan={6}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('remark', {
                    initialValue: data.remark,
                    rules: [{ required: false, message:'请填写备注' },]
                  })(
                    <Input //style={{ width: 600, marginRight: '3%' }}
                    />
                  )}</Form.Item>
              </div>
            </td>
          </tr>

          </tBody>
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
        <h2 style={{textAlign: 'center'}}>项目详细</h2>
        <Form layout="inline" >
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
        </Form>
        {_table}
      </ModalA>
    )
  }
}

AddLabProjectModal.propTypes = {
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

AddLabProjectModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddLabProjectModal = Form.create()(AddLabProjectModal);

export default AddLabProjectModal;
