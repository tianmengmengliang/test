/**
 * Created by jpt on 2018/6/21 0021.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Button,  Select, Upload, Icon, Input, DatePicker, Modal,
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
 *  实验室--已选的医嘱表
 */
class ViewD5A5ListByLabId extends Component{
  _retInitialState = ()=>{
    return {
      labId: 0,                                           // 实验室id
      spinning: false,                                   // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedRowKeys: [],                               // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,                                     // 第几页。
        pageSize: 5,                                     // 每页显示的记录条数。
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
   * 查询 Project分页列表。
   */
  getProjectIdsList = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query); //q是分页参数
    fetch('lab/getDoctorAdviceByLabId',{
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
  //----------------- end列表 ----------------------

  /**
   * 请求数据
   *
  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getProjectIdsList({pageIndex, pageSize}, (listPage)=>{
      this.setState({
        listPage
      });
    });
  }*/


  componentWillReceiveProps(nextProps){
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(newData !== oldData) {
      console.log('--componentWillReceiveProps时期--:', newData);
      if(newData!== undefined){
        this.setState({
          labId: newData.labId,
        })
        /**
         * 请求数据
         * */
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getProjectIdsList({pageIndex, pageSize, id: newData.labId}, (listPage)=>{
          this.setState({
            listPage
          });
        });
      }

    }
  }
  //-------------------- 表单提交 ---------------------------


  //-----------------------------------------------start 删除订单----------------------------
  //删除子表
  delLabDoctorAdviceClick = ({rowdata: selectedRows={}})=>{
    Modal.confirm({
      width: 416,
      iconType: 'exclamation-circle',
      title: '',
      content: '你确定要删除该记录？',
      okText: '确认删除',
      cancelText: '我再想想',
      maskClosable: false,
      onOk: ()=> {
        const { labId, } = this.state;
        this.delAdvice({doctorAdviceId: selectedRows[this.props.rowKey], labId}, (err, res = {})=> {
          // 关闭对话框
          //resolve();
          if(err){
            // case1. 删除失败
            message.error(err.message ||'删除记录失败');
          } else{
            // case2. 重置selectedIds、 重新渲染订单列表
            this.resetSelectedRowsNIds();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getProjectIdsList({pageIndex, pageSize, id:labId})
          }
        })
      },
      onCancel: ()=> {
      }
    });
  };
  delAdvice = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    console.log('selectedId',selectedId);
    fetch('lab/removeDoctorAdviceByIdAndLabId', {//labDoctorAdvice/delete
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
          title: '删除订单中...'
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
  //-----------------------------------------------end 删除子表 --------------------------------------

  //----------------------- 表格复选，数据处理。 -----------------------------
  /*onSelectChange = (selectedRowKeys, selectedRows) => {
   this.setState({
   selectedRowKeys,
   selectedRows,
   });
   }*/

  render(){
    const { data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const { listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading, labId,
      selectedRowKeys, selectedRows, } = this.state;


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
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>
              <Button
                type="danger"
                onClick={this.delLabDoctorAdviceClick.bind(this, {rowdata: record})} icon="close"> 删除医嘱 </Button>
              {/*<Divider type="vertical" />*/}
            </span>
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
        this.getProjectIdsList({pageIndex: current, pageSize, id: labId})//分页列表查询。
      }
    };

    return (
      <div>
          <Table
            className={styles['components-table-demo-nested']}
            loading={tableLoading}
            size="small"
            bordered
            rowKey={record => record.id}
            //rowSelection={rowSelection}
            columns={_columns1}
            rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
            dataSource={dataSource}
            pagination={_pagination}       //分页
          />
      </div>
    )
  }
}

ViewD5A5ListByLabId.propTypes = {
  data: PropTypes.any,
  rowKey: PropTypes.string,
  prefix: PropTypes.string.isRequired
};

ViewD5A5ListByLabId.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  callback: noop,
};

ViewD5A5ListByLabId = Form.create()(ViewD5A5ListByLabId);

export default ViewD5A5ListByLabId;
