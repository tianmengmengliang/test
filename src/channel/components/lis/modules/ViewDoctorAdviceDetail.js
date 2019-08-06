/**
 * Created by jpt on 2018/7/3 0003.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form, Row, Col, Card, Table, Button,  Select, Upload, Icon, Input, DatePicker,
    Popconfirm,InputNumber, message,} from 'antd'
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';

function noop(){}

class ViewDoctorAdviceDetail extends Component{
  _retInitialState = ()=>{
    return {
      doctorId: '',                                      //医嘱id
      confirmLoading: false,
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRowKeys: [],
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,                                     // 第几页。
        pageSize: 20,                                     // 每页显示的记录条数。
        rows: [],
        total: 0
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
      selectedIds: [],
      selectedRows: [],
    })
  };

//--------- start 查询ProjectIds分页列表接口 --------------------------
  /*componentDidMount(){
   const {data = {}} = this.props;
   console.log('--componentDidMount时期:', data.id);
   let id = {id: data.id}
   const {listPage: {pageIndex, pageSize}} = this.state;
   this.getProjectIdsList({pageIndex, pageSize, id});
   };*/

  _getAllListQuery = (pageQuery = {})=>{ //分页条件
    return {
      ...pageQuery
    }
  };

  /**
   *  查询 ProjectIds分页列表
   */
  getProjectIdsList = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query);
    fetch('labDoctorAdviceDetail/list',{
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
        message.error(err.message ||'医嘱详细列表接口报错');
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
//----------- end列表 --------------------------------------------------


  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData ){
      if(!!newData.id){
        // case1.保留id
        const {id} = newData;
        this.setState({
          doctorId: id,
        });

        //case2. 查询数据。
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getProjectIdsList({pageIndex, pageSize, id}, (listPage)=>{
          this.setState({
            listPage
          })
        });
      }
    }
  }


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
    this.props.form.resetFields();
  };


  //---------------------  条件查询 -------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}, doctorId} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize, id: doctorId,});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}, doctorId} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize, id:doctorId,})
  };

  //----------------------- 复选 ------------------------------
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows});
  }

  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading,
        spinning, tip, selectedIds, selectedRows, selectedRowKeys, doctorId,} = this.state;
    //console.log('selectedRows:',selectedRows);

    const rowSelection = {
      selectedRowKeys,  //指定选中项的 key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };

    const formEle =( <Form layout='inline'>
      <Form.Item label="设备类型">
        {getFieldDecorator('deviceTypeId', {
          rules: false
        })(
            <Input  placeholder="不限" />
        )}
      </Form.Item>
      <Form.Item label="应用名称">
        {getFieldDecorator('typeName', {
          rules: false
        })(
            <Input  placeholder="不限" />
        )}
      </Form.Item>
      <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
        <Button
            onClick={this.queryClick}
            type="primary"
            icon="search">查询</Button>
        <Button
            onClick={this.resetClick}
            icon="reload">重置</Button>
      </ButtonContainer>
    </Form> );

    const _columns1 = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 50,
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
      /*{
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
       },*/
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 400,
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
        this.getProjectIdsList({pageIndex: current, pageSize, id:doctorId,})//分页列表查询。
      }
    };
    return (
        <div>
          <ModalA
              width={1200}
              className="has-no-check-box-all"
              confirmLoading={confirmLoading}
              title={title}
              visible={visible}
              maskClosable
              footer={null}
              onOk={this.onOk.bind(this, {data: selectedIds, selectedRows} )}
              onCancel={this.onCancel}
              // bodyHeight={500}
              {...props}
          >
            <div style={{marginTop:0, marginBottom:10,}}>{formEle} </div>
            <Table
                className={styles['components-table-demo-nested']}
                loading={tableLoading}
                //size="small"
                bordered
                rowKey={record => record.id}
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

ViewDoctorAdviceDetail.propTypes = {
  data: PropTypes.any,
  prefix: PropTypes.string.isRequired,
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
};

ViewDoctorAdviceDetail.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

ViewDoctorAdviceDetail = Form.create()(ViewDoctorAdviceDetail);

export default ViewDoctorAdviceDetail;
