/**
 * Created by jpt on 2018/5/15 0015.
 */
/**
 * Created by jpt on 2018/5/11 0011.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form, Row, Col,Card, Table, Button, Checkbox, Select, Radio, Upload, Icon, Input, DatePicker,
  Popconfirm, InputNumber, message, Divider,} from 'antd'
const CheckboxGroup = Checkbox.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

import styles from '../style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../../compoents2/';
function noop(){}


/**
 * 选项目对话框
 */
class AddProjectModal extends Component{
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
      },
      localFlag: '' ,     //送检本地标志。
      deviceTypeId: '',    //仪器id
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
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      _f = { ...values};
    });
    return {
      ..._f,
      ...pageQuery
    }
  };

  /**
   * 查询 Project分页列表
   */
  getProjectIdsList = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query); //q是分页参数
    fetch('labProject/listByDeviceTypeId',{
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
      console.log('componentWillReceiveProps时期:', newData);
      this.setState({
         selectedRowKeys: newData.selectedIds, //用户已选中的项目id
         localFlag: newData.localFlag,
      })
      // 如果是外送检。
      if(newData.localFlag === 'sendOut'){
        const {listPage: {pageIndex, pageSize}, deviceTypeId } = this.state;
        this.getProjectIdsList({pageIndex, pageSize, deviceTypeId}, (listPage)=>{
          this.setState({
            listPage
          })
        });
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

  //-------------------- 表单提交 --------------------------------
  onOk = ( {data:arrSelectIds, selectedRows} )=> {
    //console.log('保存选的项目:', selectedRows );
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error(err.message||'未选择完全')
        return;
      }
      //else if( arrSelectIds.length > 0 ){
        /* 回调父组件的callback函数*/
        this.props.callback && this.props.callback({
          click: 'ok',
          data: {SelectIds: arrSelectIds, selectedRows: selectedRows }
        });
        this.setState(this._retInitialState());
        this.props.form.resetFields();
      //}
      //else {
      //  message.error(`请至少选1个项目，再点击确认`);
      //  return;
      //}
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

  //-------------------------------------- 条件查询 ----------------------------------------
  //step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}, localFlag,deviceTypeId} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize,
      deviceTypeId:localFlag ==='local'?  deviceTypeId : undefined,});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}, localFlag,deviceTypeId} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize,
      deviceTypeId: localFlag ==='local'? deviceTypeId : undefined,})
  };

  //----------------------- table表格复选，数据处理。 -----------------------------
  onSelectChange = (selectedRowKeys, selectedRows2) => {
    //1.只对选中的行数据合并，获取当前仪器id
    const {selectedRows=[], deviceTypeId,} = this.state;
      //*往选中的行数据中，塞入仪器id。
      selectedRows2.map((item)=>{
        item['deviceTypeId'] = deviceTypeId ;
      })
    let _selectedRows = selectedRows.concat( selectedRows2) //每点击一次，数组合并。

    //2.以 selectedRowKeys为条件进行，去除重复，数据过滤。
    let temp = {},//用于id判断重复
      result = [];//最后的新数组;
    _selectedRows.map((item,index)=>{
      if(!temp[item.id]){ //取反不重复。
        selectedRowKeys.map((key)=>{
           if(item.id === key){//过滤。
             result.push(item);
             temp[item.id] = true
           }
        })
      }
    });
    console.log('最后的新数组', result);
    this.setState({selectedRowKeys, selectedRows: result });
  }

  /*
   * @interface 下拉列表 Select的回调
   * @param {string} 点击的 Select 的 value
   * */
  onSelectClick = (value) => {
    const {listPage: { pageSize}} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize, deviceTypeId: value,});
    //console.log('仪器id', value);
    this.setState({
      deviceTypeId : value,
    })
  }

  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading,
      spinning, tip, selectedRowKeys, selectedRows, localFlag, deviceTypeId,} = this.state;
    //console.log('selectedRows:',selectedRows);
    //console.log('data:', data);

    //----------------------- 动态参数 ----------------------------------------
    const { devicesType =[], } = data;
    /*--------- 遍历 仪器类型 -----------*/

    const formEle =( <Form layout='inline'>
      <Form.Item label="查询项目">
        {getFieldDecorator('nameCn', {
          rules: false
        })(
          <Input placeholder="中文名称" />
        )}
      </Form.Item>
      <Form.Item //label="英文名称"
      >
        {getFieldDecorator('nameEn', {
          rules: false
        })(
          <Input  placeholder="英文名称" />
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

    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14}
    };
    const _data = (
      <Form layout="horizontal" >
        <Row>
          <Col span={8}>
            {localFlag === 'local' ?  //本地检验
              <Form.Item
                {...formItemLayout}
                label="仪器类型"
              >
                {getFieldDecorator('deviceTypeId', {
                  initialValue: data.deviceTypeId,
                  rules: [{
                    required: true, message: '请选择仪器',
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
                    onChange={this.onSelectClick}
                  >
                  {devicesType.map((k)=>{
                      return ( <Select.Option value={k.id} key={k.id}>{k.nameCn}</Select.Option>  );
                    })
                  }
                  </Select>
                )}
              </Form.Item>
              : ''}
          </Col>
       </Row>
      </Form>
    );

    const _columns1 = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 80,
        render: (value, record, i)=>{
          return (pageIndex - 1) * pageSize + i +1
        }
      },
      {
        title: '名称 ',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 250,
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
        width: 100,
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
        this.getProjectIdsList({pageIndex: current, pageSize,
          deviceTypeId : localFlag ==='local'? deviceTypeId: undefined})//分页列表查询。
      }
    };
    const rowSelection = {
      selectedRowKeys,  //指定选中项的 key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };

    return (
      <div>
        <ModalA
          width={1100}
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={title}
          visible={visible}
          maskClosable
          okText="确定"
          cancelText="取消"
          onOk={this.onOk.bind(this, {data:selectedRowKeys, selectedRows} )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >
          <div style={{marginTop:-10, marginBottom:0,}}>
            {formEle}
            <Divider type="horizontal" style={{margin:'12px 0'}}/>
          </div>

          {_data}
          <div style={{color:'#f00',textAlign:'left',}}>(*请谨慎选择项目)</div>
          <Table
            className={styles['components-table-demo-nested']}
            loading={tableLoading}
            size="small"
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

AddProjectModal.propTypes = {
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

AddProjectModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddProjectModal = Form.create()(AddProjectModal);

export default AddProjectModal;
