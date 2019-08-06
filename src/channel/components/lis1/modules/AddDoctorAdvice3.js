/**
 * Created by jpt on 2018/5/11 0011.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Button,  Select, Upload, Icon, Input, DatePicker,
  Popconfirm, InputNumber, message,} from 'antd'
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';

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
        pageIndex: 1,                                     // 第几页。
        pageSize: 10,                                     // 每页显示的记录条数。
        rows: [],
        total: 0
      }
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
  /*componentDidMount(){
    console.log('--componentDidMount时期:','查询Project分页');
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getProjectIdsList({pageIndex, pageSize});
  };*/

  _getAllListQuery = (pageQuery = {})=>{ //分页条件
    return {
      ...pageQuery
    }
  };

  /**
   * 查询 Project分页列表
   */
  getProjectIdsList = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query); //q是分页参数
    fetch('labProject/pageList',{
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
  };
//--------------------------------end列表----------------------


  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
      console.log('--componentWillReceiveProps时期:', newData);
      this.setState({
         selectedRowKeys: newData.selectedIds, //用户已选中的项目id
      })
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getProjectIdsList({pageIndex, pageSize}, (listPage)=>{
        this.setState({
          listPage
        })
      });
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



//-------------------- 表单提交--------------------------------
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
          ...values, projectIds: arrSelectIds,
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

  //----------------------- 复选 -----------------------------
  onSelectChange = (selectedRowKeys, selectedRows) => {
    //console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys, selectedRows});
  }

  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading,
      spinning, tip, selectedRowKeys, selectedRows} = this.state;
    //console.log('selectedRows:',selectedRows);

    //----------------------- 动态参数 ----------------------------------------
    const {arrTypeGroup=[{id: 0, nameCn:'类型0'},{id: 1, nameCn:'类型1'},{id: 2, nameCn:'类型2'}], } = data;
    /*--------- 遍历 -----------*/
    const _Select = arrTypeGroup.map((k)=>{
      return ( <Select.Option value={k.id} key={k.id}>{k.nameCn}</Select.Option>  );
    });

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };
    const _data = ( <div style={{marginTop:-40,}}>
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
            <Col span={12}><Form.Item
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
                  {_Select}
                </Select>
              )}
            </Form.Item></Col>
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
            <Col span={12}><Form.Item
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
                  //onChange={this.onSelectChange}
                >
                  {_Select}
                </Select>
              )}
            </Form.Item></Col>
          </Row>
        </div>);
    const _columns = [
      {
        key: 'sn',
        name: '序号',
        width: 50,
        locked: true,
        formatter: ({dependentValues,rowIdx, value})=> {
          const {listPage: {pageIndex, pageSize}} = this.state;
          return (
            <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
          )
        }
      },
      {
        key: 'nameEn',
        name: '英文',
        width: 80,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'nameCn',
        name: '项目名',
        width: 100,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'medicareCode',
        name: '医保编号',
        width: 200,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          return (
            <span>{value}</span>
          )
        }
        /* events: {
         onDoubleClick: function () {
         console.log('The user double clicked on title column');
         }
         }*/
      },
      {
        key: 'shortName',
        name: '简称',
        width: 100,
        // locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'deleteFlag',
        name: '删除标记',
        width: 100,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'remark',
        name: '备注',
        width: 250,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
    ];
    const _columns1 = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 60,
        render: (value, record, i)=>{
          return (pageIndex - 1) * pageSize + i +1
        }
      },
      /*{
       title: '设备类型',
       dataIndex: 'deviceTypeId',
       key: 'deviceTypeId',
       width: 100,
       //sorter: true,
       render: (value, record, i)=>{
       const _l = searchDeviceTypeByValues(value);
       return (
       <span>{_l["deviceType"]['nameCn']}</span>
       )
       }
       },*/
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
    ];
    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current: ', current, '; PageSize: ', pageSize); //pageSize 一页中显示的数量。
      },
      onChange: (current) => { //current 鼠标点击的第几页。
        //console.log('Current: ', current);
        this.getProjectIdsList({pageIndex: current, pageSize})//分页列表查询。
      }
    };
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
            <div style={{color:'#f00',textAlign:'left',}}>(*请谨慎选择项目)</div>
            <Table
              className={styles['components-table-demo-nested']}
              loading={tableLoading}
              //size="small"
              bordered
              rowKey={record => record.id}
              rowSelection={rowSelection}
              columns={_columns1}
              rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
              dataSource={dataSource}
              pagination={_pagination}       //分页
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
