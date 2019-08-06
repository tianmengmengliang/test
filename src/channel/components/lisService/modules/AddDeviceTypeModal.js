/**
 * Created by jpt on 2018/7/2 0002.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Checkbox, Button, Select, Radio, Upload, Icon, Input, DatePicker, Modal,
  Popconfirm, InputNumber, message,} from 'antd'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {AddProjectModal,} from './modules/'

function noop(){}

class AddDeviceTypeModal extends Component{
  _retInitialState = ()=>{
    return {
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
        title: '选项目',
        visible: false,
        data: {}
      },
      projectName: [],                              //所有输入框控件的值。
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

  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
      //console.log('--componentWillReceiveProps时期----', newData.selectedRows);
      if(newData.selectedRows !== undefined ) {
        let _selectedRowKeys = [], _selectedRows = [];
        _selectedRows = newData.selectedRows;
        _selectedRows.map((item)=> {
          _selectedRowKeys.push(item.id);
        })
        this.setState({
          selectedRowKeys: _selectedRowKeys,  //用户修改操作: 用于赛选的标志
          listPage: {rows: _selectedRows},     //用户修改操作：已选中的项目
        })
      }

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

  componentDidMount(){
    //---------- 1.仪器类型表 ------------------
    /*this.getDevicesList({}, (err, res ={})=> {
     if (err) {
     message.error('仪器类型查询失败');
     return;
     }
     this.setState({
     })
     });*/
  }

  //------- 表单提交 ----------------------------
  onOk = ( {data: arrSelectIds,  selectedRows} )=> {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error(err.message||'未选择完全')
        return;
      }
      console.log('arrSelectIds:', arrSelectIds );

        // 处理table输入的项目名称。
        const arrPName = this.generatePNameArray(values, arrSelectIds);
        //['id','name','remark','sampleTypeId','type'].forEach((key)=>{ doctorAdvice[key] = values[key];});
        const fpData = {
          ...values,
          deviceTypeProjects: arrPName,
        }

        console.log('保存:', fpData );
        fetch('deviceType/save', {
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
            message.error( err.message||`，保存数据失败`)
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

  //---------------- 获取动态表数据，重组数据结构。----------------
  generatePNameArray = (values, arrSelectIds)=>{
    //const ROW_DIMS = ['projectId', "deviceProjectName"];
    const _values = values || this.props.form.getFieldsValue();
    let arrPName = [];
    for (let i=0; i< arrSelectIds.length; i++){
      //遍历每一行的数据对象。
      let _row = {
        projectId:  arrSelectIds[i],
        deviceProjectName: _values[`deviceProjectName${i}`] === undefined ? '': _values[`deviceProjectName${i}`],
      };
      arrPName.push(_row);
    }
    return arrPName;
  }

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

  //------------------- start 选项目对话框-----------------
  addProject = ({type,  data: selectedRows=[]})=>{
    console.log('选的type:', type );
    if(type === 'add') {
      //----------------------------------------------
      this.showAdd({data: {} });
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
      //1.合并。
      const { selectedRowKeys=[], listPage:{ rows=[] } } = this.state;
      //console.log('合并rows', rows);
      let _selectedIds = selectedRowKeys.concat( SelectIds);
      let _selectedRows = rows.concat( selectedRows);
      //console.log('合并结果', _selectedRows);

      //2.去除重复。
      let _selectedIds2=[],  temp = {},_selectedRows2 = [];//最后的新数组;
      _selectedIds.map((item)=>{ //从这里开始匹配，如果没有匹配到，
        if(_selectedIds2.indexOf(item)<0){ _selectedIds2.push(item);}
      });
      _selectedRows.map((item,index)=>{
        if(!temp[item.id]){ //取反不重复。
          _selectedIds2.map((key)=>{
            if(item.id === key){
              item['projectId'] = item.id; //强塞入新的属性 projectId，配合后台需要。
              _selectedRows2.push(item);
              temp[item.id] = true
            }
          })
        }
      });
      //console.log('合并去除重结果', _selectedRows2);

      this.setState({
        selectedRowKeys: _selectedIds2,
        listPage: {rows: _selectedRows2 }
      });
      this.hiddenAdd();
      return;
    }
  };

  //------------- 删除该条记录 ---------------------------------
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
        let _selectedIds = [], _selectedRows = [];//最后的新数组的容器;
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
  //------------- end 删除 ------------------------------------


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
    //console.log("限制少于20字",value);
    if(value === undefined || value === null){
      callback();
      return ;
    }else{
      if(value.length < 20){
        callback();
        return ;
      }else{
        callback(`限制少于20字!`);
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
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {rows: dataSource,},
      tableLoading, spinning, tip, selectedRowKeys,  addProjectModal,} = this.state;
    const selectedRows = dataSource;


    //----------------------- 动态参数 ----------------------------------------
    const {doctorDviceType =[],} = data;
    /*--------- 遍历 医嘱类型 -----------*/
    const _Select1 = doctorDviceType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });


    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 16}
    };
    const formItemLayout2 = {
      labelCol: {span: 4},
      wrapperCol: {span: 20}
    };
    const formItemLayout4 = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };

    const _data = ( <div style={{marginTop:0,}}>
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
            label="仪器中文名"
            {...formItemLayout}
          >
            {getFieldDecorator('nameCn', {
              initialValue: data.nameCn,
              rules: [{required: true,  message:'请输入名称' },]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入名称`}
              />
            )}
          </Form.Item></Col>
          <Col span={6}><Form.Item
            {...formItemLayout2}
            label="品牌"
            //hasFeedback
          >
            {getFieldDecorator('brand', {
              initialValue: data.brand,
              rules: [{
                required: false, message: '请填写品牌',
              }]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请填写品牌`}
              />
            )}
          </Form.Item></Col>
          <Col span={10}><Form.Item
            {...formItemLayout4}
            //required
            label="生产厂家">
            {getFieldDecorator('manufacturer', {
              initialValue: data.manufacturer,
              rules: [
                { required:false, message:'请填写生产厂家' }
              ],
            })(
              <Input
                size="large"
                placeholder="请填写生产厂家"
              />
            )}
          </Form.Item></Col>
        </Row>

        <Row>
          <Col span={8}><Form.Item
            label="仪器英文名"
            {...formItemLayout}
          >
            {getFieldDecorator('nameEn', {
              initialValue: data.nameEn,
              rules: [{required: false,  message:'请输入名称' },]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入名称`}
              />
            )}
          </Form.Item></Col>
          <Col span={6}><Form.Item
            {...formItemLayout2}
            label="型号"
          >
            {getFieldDecorator('model', {
              initialValue: data.model,
              rules: [{
                required: false, message: '请输入型号',
              }]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入型号`}
              />
            )}
          </Form.Item></Col>
          <Col span={10}><Form.Item
            {...formItemLayout4}
            //required
            label="注册证号">
            {getFieldDecorator('registration', {
              initialValue: data.registration,
              rules: [
                { required: false, message:'请输入注册证号' }
              ],
            })(
              <Input
                size="large"
                placeholder="请输入注册证号"
              />
            )}
          </Form.Item></Col>
        </Row>

        {/* 3.方法学、选项目按钮。*/}
        <Row>
          <Col span={8}><Form.Item
            label="方法学"
            {...formItemLayout}
          >
            {getFieldDecorator('methodology', {
              initialValue: data.methodology,
              rules: [
                {required: false,},
              ]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入方法学`}
              />
            )}
          </Form.Item></Col>
          <Col span={6}> </Col>
          <Col span={4}><div style={{marginTop:5,marginLeft:'40%'}}>
            <Button onClick={this.addProject.bind(this, {type:'add', data:{}})}  type="primary"  icon="plus">选择项目</Button>
          </div></Col>
        </Row>
      </div>
    );

    const _columns1 = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 60,
        render: (value, record, i)=>{
          return (
            <span>{i+1}</span>
          )
        }
      },
      {
        title: '名称 ',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 200,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '英文名称 ',
        dataIndex: 'nameEn',
        key: 'nameEn',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 350,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '仪器所对项目名称',
        dataIndex: 'deviceProjectName',
        key: 'deviceProjectName',
        width: 300,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>
               <Form.Item>
                 {getFieldDecorator(`deviceProjectName${i}`, {
                   initialValue: value,
                   rules: [
                     {required: false }, // message:'请输入项目名称'
                     {validator:this.disabledLength}
                   ]
                 })(
                   <Input
                     size="large"
                     //style={{width: 300}}
                     placeholder={`请输入项目名称`}
                   />
                 )}
               </Form.Item>
            </span>
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
          onOk={this.onOk.bind(this, {data: selectedRowKeys, selectedRows} )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >
          { _data}

          <div className="hidden">
            <AddProjectModal {...addProjectModal} callback={this.addProjectCallback}/>
          </div>

          <div style={{textAlign:'left',}}>(已选择项目)</div>
          <Table
            className={styles['components-table-demo-nested']}
            loading={tableLoading}
            bordered
            rowKey={record => record.id}
            columns={_columns1}
            rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
            dataSource={dataSource}
            pagination={false}
          />
        </ModalA>
      </div>
    )
  }
}

AddDeviceTypeModal.propTypes = {
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

AddDeviceTypeModal.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddDeviceTypeModal = Form.create()(AddDeviceTypeModal);

export default AddDeviceTypeModal;
