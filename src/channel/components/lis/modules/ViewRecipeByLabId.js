/**
 * Created by jpt on 2018/6/22 0022.
 */
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
 *  实验室--已选的套餐表
 */
class ViewRecipeByLabId extends Component{
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

//--------- start 查询已选的套餐。 --------------------------
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
   * 查询实验室,已选的套餐分页列表。
   */
  getRecipePageListByLabId = (query)=>{
    //console.log('分页参数', query);
    const _q = this._getAllListQuery(query); //q是分页参数
    fetch('labRecipe/listByLabId',{
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
   componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getRecipePageListByLabId({pageIndex, pageSize}, (listPage)=>{
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
        this.getRecipePageListByLabId({pageIndex, pageSize, id: newData.labId}, (listPage)=>{
          this.setState({
            listPage
          });
        });
      }

    }
  }

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
        selectedRows.forEach((key)=>{ _doctorAdviceId.push({doctorAdviceId: key.id});});
        //let AdviceId = arrSelectIds.join();
        let fpdata= {
          id: this.state.labId,
          doctorAdvices: _doctorAdviceId,
        }
        //console.log('添加设备类型2:', fpdata);
        fetch('laba/addDoctorAdvice', {
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

  //-----------------------------------------------start 删除订单----------------------------
  //删除实验室，已选的套餐。
  delLabRecipeClick = ({rowdata: selectedRows ={}})=>{
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
        this.delLabRecipe({recipeId: selectedRows[this.props.rowKey], labId}, (err, res = {})=> {
          // 关闭对话框
          //resolve();
          if(err){
            // case1. 删除失败
            message.error(err.message ||'删除记录失败');
          }else{
            // case2. 重置selectedIds、 重新渲染订单列表
            this.resetSelectedRowsNIds();
            const {listPage: {pageIndex, pageSize}}= this.state;
            this.getRecipePageListByLabId({pageIndex, pageSize, id:labId})
          }
        });
      },
      onCancel: ()=> {
      }
    });
  };
  delLabRecipe = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('lab/removeRecipeByIdAndLabId', {
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
        title: '套餐名称',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '助记码 ',
        dataIndex: 'shortName',
        key: 'shortName',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '临床意义',
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
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 120,
        sortable: false,
        render: (value, record, i)=>{
          return (
            <span>
              <Button
                type="danger"
                onClick={this.delLabRecipeClick.bind(this, {rowdata: record})} icon="close"> 删除套餐 </Button>
              {/*<Divider type="vertical" />*/}
            </span>
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
        this.getRecipePageListByLabId({pageIndex: current, pageSize, id: labId})//分页列表查询。
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

ViewRecipeByLabId.propTypes = {
  data: PropTypes.any,
  rowKey: PropTypes.string,
  prefix: PropTypes.string.isRequired
};

ViewRecipeByLabId.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  callback: noop,
};

ViewRecipeByLabId = Form.create()(ViewRecipeByLabId);

export default ViewRecipeByLabId;
