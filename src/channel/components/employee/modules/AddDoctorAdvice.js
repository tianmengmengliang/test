/**
 * Created by jpt on 2018/5/15 0015.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Button,  Select, Upload, Icon, Input, DatePicker,Modal,
  Popconfirm, InputNumber, message,} from 'antd'
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {AddProjectModal,} from './modules/'

function noop(){}

class AddDoctorAdvice extends Component{
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

  //-------------------- 表单提交----------------------------
  onOk = ( {data: arrSelectIds,  selectedRows} )=> {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error(err.message||'未选择完全')
        return;
      }
      else if ( arrSelectIds.length > 0 ) {
        //join --> string   JSON.stringify(xxxxxx),
        //let doctorAdvice={};
        //['id','name','remark','sampleTypeId','type'].forEach((key)=>{ doctorAdvice[key] = values[key];});
        const fpData = {
          ...values,
          projectIds: arrSelectIds,
        }
        //console.log('保存选的项目2:', fpData );
        fetch('doctorAdvice/save', {
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
            message.error('保存数据失败')
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
      }
      else {
        message.error(`请至少选1个项目，再点击确认`);
        return;
      }

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
      const { selectedRowKeys=[], listPage:{ rows=[] } } = this.state;
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
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {rows:dataSource, },
      tableLoading, spinning, tip, selectedRowKeys, selectedRows, addProjectModal} = this.state;
    //console.log('selectedRows:',selectedRows);
    //console.log('data:', data);

    //----------------------- 动态参数 ----------------------------------------
    const {doctorDviceType =[], sampleType =[], } = data;
    /*--------- 遍历 医嘱类型 -----------*/
    const _Select1 = doctorDviceType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });
    /*--------- 遍历 样本类型 -----------*/
    const _Select2 = sampleType.map((k)=>{
      return ( <Select.Option value={k.id} key={k.id}>{k.name}</Select.Option>  );
    });

    const formItemLayout = {
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
          <Col span={12}><Form.Item
            label="医嘱名称"
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              initialValue: data.name,
              rules: [{required: true,  message:'请输入医嘱名称' },]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入医嘱名称`}
              />
            )}
          </Form.Item></Col>
          <Col span={8}><Form.Item
            {...formItemLayout}
            label="医嘱类型"
            //hasFeedback
          >
            {getFieldDecorator('type', {
              initialValue: data.type,
              rules: [{
                required: true, message: '请选医嘱类型',
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
                //onChange={this.onSelectChange}
              >
                {_Select1}
              </Select>
            )}
          </Form.Item></Col>
          <Col span={4}></Col>
        </Row>
        <Row>
          <Col span={12}><Form.Item
            {...formItemLayout}
            //required
            label="备注">
            {getFieldDecorator('remark', {
              initialValue: data.remark,
              rules: [
                { required:false, message:'请输入备注' }
              ],
            })(
              <Input
                size="large"
                placeholder="请输入描述备注"
              />
            )}
          </Form.Item></Col>
          <Col span={8}><Form.Item
            {...formItemLayout}
            label="样本类型"
          >
            {getFieldDecorator('sampleTypeId', {
              initialValue: data.sampleTypeId,
              rules: [{
                required: true, message: '请输入样本类型',
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
                {_Select2}
              </Select>
            )}
          </Form.Item></Col>
          <Col span={4}><div style={{marginTop:5,}}>
            <Button onClick={this.addProject.bind(this, {type:'add', data:{}})}  type="primary"  icon="plus">选择项目</Button>
          </div></Col>
        </Row>
    </div> );
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
        title: '简称',
        dataIndex: 'shortName',
        key: 'shortName',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '用量单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '删除标记',
        dataIndex: 'deleteFlag',
        key: 'deleteFlag',
        width: 100,
        sortable: false,
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
        width: 200,
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
        width: 200,
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
          width={1200}
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={title}
          visible={visible}
          okText="确定"
          cancelText="取消"
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
          />
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
