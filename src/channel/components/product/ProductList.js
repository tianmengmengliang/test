/**
 * Created by jpt on 2018/5/25 0025.
 */
import React, { PureComponent, Fragment, Component,} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table,Tabs, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker,
  Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
import styles from './style.less';
import moment from 'moment'
import { GridTable, ButtonContainer,} from '../../../compoents2/';
import {AddProductSaveModal,} from './modules/'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchLocationByValues} from 'antd/../../src/compoents2/location/location.js'; //匹配省市区
import { fetch,CONFIG,} from '../../../services/'



class ProductList extends Component {
  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      addProductSaveModal: {                            // 新建
        title: '新增',
        visible: false,
        data: {}
      },
    }
  };
  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  /* @interface 清空行选择数据
   * * */
  resetSelectedRowsNIds = ()=>{
    this.setState({
      selectedIds: [],
      selectedRows: [],
    })
  };

  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getProductList({pageIndex, pageSize});
  }

  /**
   * 1.查询及请求参数。
   **/
  _getAllListQuery = (pageQuery = {})=>{
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      _f = { ...values};
    });
    // step1 获取所有查询参数
    return {
      ..._f,
      ...pageQuery
    }
  };

  /*
   * @interface 获取列表
   * */
  getProductList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    fetch('product/pageList', {
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
        // step1.
        message.error(err.message||'分页列表接口报错');
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

  /*
   * @interface 表格排序
   * @param {string} sortColumn 排序的列的key
   * @param {string} sortDirection 排序的方向
   * */
  handleGridSort(sortColumn, sortDirection) {
    //console.log('sortColumn',sortColumn,' sortDirection',sortDirection);
    const comparer = (a, b) => {
      // 1.从小到大。
      if (sortDirection === 'ASC') {
        return (a[sortColumn] < b[sortColumn]) ? 0 : -1;  //0 升序
      }
      // 2.从大到小。
      else if (sortDirection === 'DESC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1;  //1 降序
      }
    };
  };

  //-----------------------------start 新增、修改-------------------------------
  _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
    if(selectedIds.length === 0){
      // s1-case1. 没有选中任何行数据提示
      message.warn(`${nullText || '你未选中任何记录'}`);
      return false
    }else if(selectedIds.length > 1 ){
      // s1-case2. 选中超过2行数据提示
      message.warn(`${moreText || '你只能选择一条记录'}`);
      return false;
    }
    return true
  };
  /*
   * @interface 显示添加订单对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  add = ({type,  data: selectedRows=[]})=>{
    if(type === 'add') {
      this.showAdd({
        data: {}
      });
    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
          /***********************************/
          /*this.getDeviceType((err, res)=> { //1.产品类型
           if (err) {
           message.warn(err.message||`查询设备类型不存在`);
           return;
           }
           const _daviceType = res.responseObject;*/
          /************************************/
          this.showAdd({
            data: selectedRows[0],
          });
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addProductSaveModal})=>{
      return {
        addProductSaveModal: {
          ...addProductSaveModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addProductSaveModal})=>{
      return {
        addProductSaveModal: {
          ...addProductSaveModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      this.resetSelectedRowsNIds();
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDeviceRegisterList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
  //------------------------------ end 新增、修改 --------------------------------

  //------------------------------ start 删除订单 -------------------------------
  /*
   * @interface 删除一条记录
   * */
  delOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要删除该记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          this.delOrder({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error('删除设备类型记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getDeviceRegisterList({pageIndex, pageSize})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  delOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
    fetch('api/device/delectDeviceInfo', {
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
        /* this.setState({
         spinning: true,
         title: '删除订单中...'
         })*/
      },
      complete: (err, data)=>{
        /* this.setState({
         spinning: false,
         title: ''
         })*/
      }
    })
  };
  //------------------------------ end 删除注册设备 -----------------------------

  //------------------------------start 条件查询 --------------------------------
  //step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getProductList({pageIndex: 1, pageSize});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getProductList({pageIndex: 1, pageSize})
  };

  //----------------------- 表格复选，数据处理。 -----------------------------
  onSelectChange = (selectedIds, selectedRows) => {
    this.setState({selectedIds,  selectedRows });
  }


  render() {
    const {form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading, spinning,
      selectedIds, selectedRows, tip, addProductSaveModal, residences,} = this.state;
    //console.log('rows',rows);

    const rowSelection = {
      selectedIds,  //指定选中项的key数组，需要和 onChange进行配合
      onChange: this.onSelectChange,
    };
    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//实验室类型模块---匹配字典表。
    lisType = searchTextByValues('lis_type');//lis类型模块---匹配字典表。

    const formEle =( <Form layout='inline'>
        <Form.Item //label="产品名称"
        >
          {getFieldDecorator('name', {
            rules: false
          })(
            <Input  placeholder="产品名称" />
          )}
        </Form.Item>
        <Form.Item //label="产品编号"
        >
          {getFieldDecorator('code', {
            rules: false
          })(
            <Input  placeholder="产品编号" />
          )}
        </Form.Item>
        <Form.Item //label="类型"
        >
          {getFieldDecorator('type', {
            rules: false
          })(
            <Input  placeholder="类型" />
          )}
        </Form.Item>
        <Form.Item //label="Erp编号"
        >
          {getFieldDecorator('erpCode', {
            rules: false
          })(
            <Input  placeholder="Erp编号" />
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
      </Form>
    );
    const _columns = [
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
        title: '产品名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value }</span>
          )
        }
      },
      {
        title: '产品编号 ',
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
        title: '产权',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        sortable: false,
        render: (value, record, i)=> {
          switch (value) {
            case 0 :
              return (<span style={{color:'#00EA00'}}>{'自产'}</span> );
              break;
            case 1 :
              return (<span style={{color:'#f00'}}>{'代理' }</span>);
              break;
            default :
              return (<span style={{color:'#F9A704'}}>{'情况未知' }</span>)
          }
        }
      },
      {
        title: '机构id',
        dataIndex: 'orgId',
        key: 'orgId',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '医疗注册号',
        dataIndex: 'medicalRegisterCode',
        key: 'medicalRegisterCode',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: 'erp编号',
        dataIndex: 'erpCode',
        key: 'erpCode',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '生产厂家',
        dataIndex: 'vendor',
        key: 'vendor',
        width: 100,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '描述',
        dataIndex: 'descInfo',
        key: 'descInfo',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 150,
        //sortable: true,
        render: (value, record, i)=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        }
      },
    ];

    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: true,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current:', current, '; PageSize: ', pageSize);
      },
      onChange: (current) => {
        this.getProductList({pageIndex: current, pageSize})
      }
    };
    return (
      <PageHeaderLayout>
        <div style={{marginTop: -20,}}>
          <div className="hidden">
            <AddProductSaveModal {...addProductSaveModal} callback={this.addCallback} />
          </div>

          <Card bordered={false}>
            <div style={{marginTop:-20, marginBottom:-10}}>{formEle} </div>
            <Spin
              spinning={spinning}
              tip={tip}>
              {/* 1.查询栏 */}
              <ButtonContainer>
                <Button onClick={this.add.bind(this, {type: 'add', data:{}})} type="primary"><Icon type="plus" />新增产品</Button>
                <Button onClick={this.add.bind(this, {type: 'edit', data: selectedRows})} type="primary"><Icon type="edit" />修改</Button>
                <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger"><Icon type="close" />删除</Button>
              </ButtonContainer>
              <Table
                style={{ marginBottom: 8 }}
                loading={tableLoading}
                //size="small"
                bordered
                rowKey={(record, i)=>{return `${record.id}`}}
                rowSelection={rowSelection}
                columns={_columns}
                rowClassName={(record) => {return record.editable ? styles.editable : ''; }}
                dataSource={dataSource}
                pagination={_pagination}       //分页
                height={400}
                scroll={{x: 1050}}
                //onChange={this.handleGridSort}  //分页、排序、筛选的触发该函数。
              />
            </Spin>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

ProductList.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string,
};

ProductList.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id'
};

ProductList = Form.create()(ProductList);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(ProductList);
