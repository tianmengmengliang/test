/**
 * Created by jpt on 2018/5/15 0015.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Button,  Select, Upload, Icon, Input, DatePicker,Modal,
  Popconfirm, InputNumber, message, Alert } from 'antd'
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {AddProjectModal,} from './modules/';

import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import './customTable.less'
function noop(){}

//-------------------------- 动态表的字段名 -----------------------------------------------
const ROW_DIMS = ["name", "mobile", "qq", "email"];
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


class AddDoctorAdvice extends Component{
  _retInitialState = ()=>{
    return {
      samples: [],                                        //[ generateRows(1) ]
      confirmLoading: false,
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedRowKeys: [],                                // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        //pageIndex: 1,                                     // 第几页。
        //pageSize: 10,                                     // 每页显示的记录条数。
        rows: [],
        //total: 0
      },
      addProjectModal: {                            // 新建
        title: '',
        visible: false,
        data: {}
      },
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

  /**
   * 查询 Project 分页列表
   */
  /*getProjectIdsList = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query); //q是分页参数
    fetch('labProject/list',{
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage} = res;
        this.setState({
          listPage
        })
      },
      error: (err)=>{
        message.error(err.message||'project分页列表接口报错');
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
  };*/
//--------------------------------end列表----------------------


  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
      //console.log('--componentWillReceiveProps时期:', newData);
      this.setState({
        listPage: {rows:  newData.selectedRows } //用户已选中的项目
      })
    }
  }
  handleRowUpdated = ({ rowIdx, updated })=> {
    // merge updated row with current row and rerender by setting state
    const {listPage} = this.state;
    const {rows} = listPage;
    Object.assign(rows[rowIdx], updated);
    this.setState({
      listPage
    });
  };

  //表单提交
  onOk = ( {data: arrSelectIds,  selectedRows} )=> {
    console.log('参数:', selectedRows );
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error(err.message||'未选择完全')
        return;
      }
      //声明容器
      let basic={}, arrSample =[]; //, workGroupDetailVos =[]
      // case.1.基本数据。
      ['id','nameCn', 'nameEn','type','descInfo', 'orgId'].forEach((key)=>{
          basic[key] = values[key]; //js语法：塞入新属性。
      });
      // case.2.动态表数据。
      arrSample = this.generateSamplesArray(values);

      //数据汇总
      let fpData = {
        ...basic,
        workGroupDetailVos: selectedRows.concat(arrSample),
      }

        //console.log('保存选的项目2:', fpData );
        fetch('workGroup/save', {
          // method: 'post',
          // headers: {},
          data: fpData,
          success: (res)=> {
            /* 回调父组件的callback函数 */
            this.props.callback && this.props.callback({
              click: 'ok',
              data: null,
            });
            message.success(`保存成功`);
            /*将组件重置到初始状态*/
            this.setState(this._retInitialState());
            this.props.form.resetFields()
          },
          error: (err)=> {
            message.error(err.message||',保存数据失败')
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
    /* 回调父组件的callback函数*/
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields()
  };
  //---------------------------------------------------------

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
    //if(samples.length < 2 ){  _samples = samples;
    //}else{
      _samples = samples.filter((_row, i)=>{return rowIdnex !== i}); //保留未被选中的行。
    //}

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
  /** 3.1.验证英文联系人姓名的长度 **/
  disabledNameLength =(rule, value, callback)=>{
    if(value === undefined || value === null){
      callback();
      return ;
    }else{
      if(value.length < 30){
        callback();
        return ;
      }else{
        callback(`限制少于30字!`);
      }
    }
  }


  //------------------- start 选项目 -----------------
  addProject = ({type,  data: selectedRows=[]})=>{
    console.log('选的type:', type );
    if(type === 'add') {
      this.showAdd({data:{}});
    }
  };
  showAdd = ({data})=>{
    this.setState(({addProjectModal})=>{
      return {
        addProjectModal: {
          ...addProjectModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addProjectModal})=>{
      return {
        addProjectModal: {
          ...addProjectModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addProjectCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      console.log(info);
      const {SelectIds, selectedRows} = data; //将子组件数据传给 父组件。
      //合并。
      const {selectedRowKeys=[], listPage:{ rows=[] } } = this.state;
      let _selectedIds = selectedRowKeys.concat( SelectIds);
      let _selectedRows = rows.concat( selectedRows);
      //去除重复。
      let _selectedIds2=[], temp = {}, _selectedRows2 = [];//最后的新数组;
      _selectedIds.map((item)=>{ //从这里开始匹配，如果没有匹配到，
         if(_selectedIds2.indexOf(item)<0){ _selectedIds2.push(item);}
      })
      _selectedRows.map((item,index)=>{
        if(!temp[item.id]){//取反不重复。
          _selectedIds2.map((key)=>{
            if(item.id === key){
              _selectedRows2.push(item);
              temp[item.id] = true
            }
          })
        }
      });

      this.setState({
        selectedRowKeys: _selectedIds2,
        selectedRows:  _selectedRows2,
        listPage: {rows: _selectedRows2 }
      });
      this.hiddenAdd();
      return;
    }
  };

  //------------- 删除该条记录 ----------------------------------------
  delRowClick =( {rowdata: record} ) =>{
    console.log('record', record);
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
          selectedRows:  _selectedRows,
          listPage: {rows: _selectedRows},
        })
      },
      onCancel: ()=> {
      }
    });
  }

  //----------------------- 复选 -----------------------------
  onSelectChange = (selectedRowKeys, selectedRows) => {
    //console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys, selectedRows});
  }

  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, samples =[], listPage: {rows:dataSource, },
      tableLoading, spinning, tip, selectedRowKeys, selectedRows, addProjectModal} = this.state;
    //console.log('selectedRows:', selectedRows);
    //console.log('data:', data);

    //----------------------- 动态参数 ----------------------------------------
    let doctorDviceType = [];
    doctorDviceType = searchTextByValues('work_group_type');//模块名称---匹配字典表。
    /*--------- 遍历 医嘱类型 -----------*/
    const _Select1 = doctorDviceType.map((k)=>{
      let value = Number();
      return ( <Select.Option value={k.value} key={k.id}>{k.text}</Select.Option>  );
    });

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };
    const formItemLayout2 = {
      labelCol: {span: 8},
      wrapperCol: {span: 12}
    };
    const _data = (
      <div style={{marginTop:0,}}>
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
        <Row>
          <Col span={8}><Form.Item
            label="中文名"
            {...formItemLayout}
          >
            {getFieldDecorator('nameCn', {
              initialValue: data.nameCn,
              rules: [{required: true,  message:'请输入中文名' },]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入中文名`}
              />
            )}
          </Form.Item></Col>
          <Col span={6}><Form.Item
            {...formItemLayout2}
            label="工作组类型"
            //hasFeedback
          >
            {getFieldDecorator('type', {
              initialValue: data.type,
              rules: [{
                required: true, message: '请选工作组类型',
              }]
            })(
              <Select
                size="large"
                style={{width: 150, marginRight: '3%' }}
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
          </Form.Item></Col>
          <Col span={8}><Form.Item
              label="描述"
              {...formItemLayout}
            >
              {getFieldDecorator('descInfo', {
                initialValue: data.descInfo,
                rules: [{required: false ,  message:'请填写描述' },]
              })(
                <Input
                  size="large"
                  //style={{width: 300}}
                  placeholder={`请输入描述`}
                />
              )}
            </Form.Item></Col>
        </Row>
        <Row>
          <Col span={8}><Form.Item
            {...formItemLayout}
            //required
            label="英文名">
            {getFieldDecorator('nameEn', {
              initialValue: data.nameEn,
              rules: [
                { required:false, message:'请填写英文名' }
              ],
            })(
              <Input
                size="large"
                placeholder="请输入英文名"
              />
            )}
          </Form.Item></Col>
          <Col span={6}><Form.Item
            {...formItemLayout2}
            label="机构"
          >
            {getFieldDecorator('orgId', {
              initialValue: data.orgId,
              rules: [{
                required: true, message: '请选择机构',
              }]
            })(
              <Select
                size="large"
                style={{width: 150, marginRight: '3%' }}
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
                <Select.Option value={1} key={1}>{'中翰盛泰'}</Select.Option>
                <Select.Option value={2} key={2}>{'中翰生物'}</Select.Option>
                <Select.Option value={8} key={8}>{'九洲大药房'}</Select.Option>
              </Select>
            )}
          </Form.Item></Col>
          <Col span={8}><div style={{marginTop:5,marginLeft:'40%'}}>
            <Button onClick={this.addProject.bind(this, {type:'add', data:{}})}  type="primary"  icon="plus">选择人员</Button>
          </div></Col>
        </Row>
    </div>  );


    const tableCls = cx({
      [`${prefix}-custom-table`]: true
    });
    const inlineTableCls = cx({
      [`inline-table`]: true
    });
    const titleStyle2 = {background:'#fafafa'};
    const inlineTrCls = cx({
      [`inline-tr`]: true,
    });
    //---------------------------动态表-------------------------------------
    const _tr = samples.map((k,index) => { //k数组中的元素  index数组下标。
      return ( <tr key={index}>
        <td>
          <Form.Item  key={k}>
            {getFieldDecorator(`name${index}`,{
              initialValue: k['name'],
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: true, message:"人员姓名"},
                {validator: this.disabledNameLength }
              ],
            })(
              <Input  style={{width: '90%', marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`mobile${index}`,{
              initialValue: k['mobile'],//
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: true, message:"请输手机号"},
                {validator: this.checkTel}
              ],
            })(
              <Input style={{width: '90%',marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`qq${index}`,{
              initialValue: k['qq'],//
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: false, message:"请输正确格式"},
                {validator: this.disabledNameLength }
              ],
            })(
              <Input style={{width: '90%',marginLeft:2 }} />
            )}
          </Form.Item>
        </td>
        <td>
          <Form.Item key={k}>
            {getFieldDecorator(`email${index}`,{
              initialValue: k['email'],//
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {required: false, message:"请输正确格式" },
                {validator: this.disabledNameLength }
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
          <tBody>
          <tr>
            <td>
              <table className={inlineTableCls}>
              <tr>
                <td style={titleStyle2}><div className={`${inlineTrCls}`}>姓名</div></td>
                <td style={titleStyle2}><div className={`${inlineTrCls}`}>手机号</div></td>
                <td style={titleStyle2}><div className={`${inlineTrCls}`}>QQ号</div></td>
                <td style={titleStyle2}><div className={`${inlineTrCls}`}>邮箱</div></td>
                <td style={titleStyle2}><div className={`${inlineTrCls}`}>操作</div></td>
              </tr>
              {_tr}
              <tr>
                  <Button onClick={this.addk} style={{ width:100, marginLeft:10,marginTop:10, marginBottom:10,}}>
                    <Icon type="plus" />
                  </Button>
              </tr>
              </table>
            </td>
          </tr>
          </tBody>
        </table>
      </div>
    );

    const _columns1 = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 50,
        render: (value, record, i)=>{
          return  i +1
        }
      },
      {
        title: '员工编号 ',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '手机',
        dataIndex: 'mobile',
        key: 'mobile',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: 'QQ号',
        dataIndex: 'qq',
        key: 'qq',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
        width: 50,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>
               <Button onClick={this.delRowClick.bind(this, {rowdata: record})} type="primary" icon="close" size='small'>删除</Button>
            </span>
          )
        }
      },
    ];
    const rowSelection = {
      selectedRowKeys,  //指定选中项的 key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };
    return (
      <div>
        <ModalA
          width={1000}
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={title}
          visible={visible}
          okText="确定"
          cancelText="取消"
          onOk={this.onOk.bind(this, {data:selectedRowKeys, selectedRows} )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >
          {/*-----基础字段-------*/}
          { _data}
          <div className="hidden">
            <AddProjectModal {...addProjectModal} callback={this.addProjectCallback}/>
          </div>
          {/*-----已选人员-------*/}
          <div>
            <Alert message="已选人员" type="info" />
            <Table
              className={styles['components-table-demo-nested']}
              loading={tableLoading}
              bordered
              rowKey={record => record.id}
              columns={_columns1}
              rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
              dataSource={dataSource}
            />
          </div>
          {/*-----动态表-------*/}
          <div style={{marginTop:10}}>
            <Alert message="补充非员工人员" type="info" />
             {_table}
          </div>
        </ModalA>
      </div>
    )
  }
}

AddDoctorAdvice.propTypes = {
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

AddDoctorAdvice.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddDoctorAdvice = Form.create()(AddDoctorAdvice);

export default AddDoctorAdvice;
