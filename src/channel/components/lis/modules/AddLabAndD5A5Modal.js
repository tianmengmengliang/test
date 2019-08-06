/**
 * Created by jpt on 2018/5/22 0022.
 */
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
import {searchTextByValues }      from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchSampleTypeByValues} from 'antd/../../src/compoents2/location/SampleTypeList.js'; //匹配样本类型
function noop(){}

/**
 *  选医嘱对话框。
 */
class AddLabAndD5A5Modal extends Component{
  _retInitialState = ()=>{
    return {
      confirmLoading: false,
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      labId: 0,                                           // 实验室id

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
    fetch('doctorAdvice/list',{
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
        message.error(err.message||'选医嘱，列表接口报错');
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
      if(newData!== undefined){
        this.setState({
          labId: newData.id, //实验室id
          selectedRowKeys: newData.selectedIds, //已选中的医嘱id
        })
      }

      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getProjectIdsList({pageIndex, pageSize}, (listPage)=>{
        this.setState({
          listPage
        });
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

  //-------------------- 表单提交 --------------------------------
  onOk = ( {data: arrSelectIds, selectedRows} )=> {
    //console.log('保存选的项目:', arrSelectIds );
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error(err.message||'未选择完全')
        return;
      }
      else if( arrSelectIds.length>0 ){
        let _doctorAdviceId= [];
        arrSelectIds.forEach((key)=>{ _doctorAdviceId.push({doctorAdviceId: key});});
        //let AdviceId = arrSelectIds.join();
        let fpdata= {
          id: this.state.labId,
          doctorAdvices: _doctorAdviceId,
        }
        //console.log('添加设备类型2:', fpdata);
        fetch('lab/addDoctorAdvice', {
          // method: 'post',
          // headers: {},
          data: fpdata,
          success: (res)=> {
            message.success(`选医嘱保存成功`);
            /* 回调父组件callback函数。*/
            this.props.callback && this.props.callback({
              click: 'ok',
              data: fpdata,
            });
            this.setState(this._retInitialState());
            this.props.form.resetFields();
          },
          error: (err)=> {
            message.error(err.message||'保存数据失败');
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

  //-------------------------------------- 条件查询 ----------------------------------------
  //step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getProjectIdsList({pageIndex: 1, pageSize})
  };

  //----------------------- 表格复选，数据处理。 -----------------------------
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading,
      spinning, tip, selectedRowKeys, selectedRows} = this.state;
    //console.log('selectedRows:',selectedRows);


    const formEle =( <Form layout='inline'>
      <Form.Item label="中文名称">
        {getFieldDecorator('nameCn', {
          rules: false
        })(
          <Input  placeholder="不限" />
        )}
      </Form.Item>
      <Form.Item label="英文名称">
        {getFieldDecorator('nameEn', {
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
        width: 30,
        render: (value, record, i)=>{
          return (pageIndex - 1) * pageSize + i +1
        }
      },
      {
        title: '医嘱中文 ',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 170,
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
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 250,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '医嘱类型',
        dataIndex: 'type',
        key: 'type',
        width: 80,
        sortable: false,
        render: (value, record, i)=>{
          //医嘱类型模块
          let _arr =[], text='';
          _arr = searchTextByValues('doctor_advice_type');//模块名称---匹配字典表。
          if(_arr.length > 0) {
            _arr.map((item)=> {
              if (value === item.value) {
                text = item.text;
                return
              }
            })
          }
          return (
            <span>{text}</span>
          )
        }
      },
      {
        title: '样本类型',
        dataIndex: 'sampleTypeId',
        key: 'sampleTypeId',
        width: 80,
        sortable: false,
        render: (value, record, i)=>{
          let l = searchSampleTypeByValues(value);
          return (
            <span>{l}</span>
          )
        }
      },
      /*{
        title: '删除标志',
        dataIndex: 'deleteFlag',
        key: 'deleteFlag',
        width: 80,
        sortable: false,
        render: (value, record, i)=>{
          switch(value){
            case 0 :  return (<span style={{color:'#00EA00'}}>{'正常'}</span> );  break;
            case 1 :  return (<span style={{color:'#f00'}}>{'删除' }</span>);  break;
            default :  return (<span style={{color:'#F9A704'}}>{'情况未知' }</span>)
          }
        }
      },*/
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
          width={1000}
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
          <div style={{marginTop:-10, marginBottom:0,}}>{formEle} </div>
          <div style={{color:'#f00',textAlign:'left',}}>(请选择医嘱)</div>
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

AddLabAndD5A5Modal.propTypes = {
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

AddLabAndD5A5Modal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddLabAndD5A5Modal = Form.create()(AddLabAndD5A5Modal);

export default AddLabAndD5A5Modal;
