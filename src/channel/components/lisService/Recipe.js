/**
 * Created by jpt on 2018/6/25 0025.
 */
import React, { PureComponent, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import numeral from 'numeral';
import moment from 'moment'
import {Row, Col,Form, Card, Table, Tabs, Button, Input, message, Popconfirm, Divider, Cascader,
  Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import classNames from 'classnames';
import { AddLabAndRecipeModal, } from './modules/'
import { ViewRecipeDetail, } from '../lis/modules/'

import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchLocationByValues} from 'antd/../../src/compoents2/location/location.js'; //匹配省市区
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch }from '../../../services/'

/**
 * 查询实验室，已选套餐。
 * */
class Recipe extends Component {

  _retInitialState = ()=>{
    return {
      labId: '',                                           // 实验室id
      labList: [],                                         // 拥有的所有实验室。
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      detailRows: [],
      tableLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      addLabAndRecipeModal: {                            // 新建
        title: '选套餐',
        visible: false,
        data: {}
      },
      viewRecipeDetail: {
        title: '',
        visible: false,
        data: {}
      },
      expandForm: false,                                //按条件查询框的: 收起/展开。
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
      selectedRows: []
    })
  };

  componentDidMount(){
    //step.1 查询当前机构所拥有的all Lab.
    this.getLabTypleList({pageIndex:1, pageSize:1000});
    //step.2 查询分页列表
    /* 根据实验室列表的第一项,查询分页。*/
    /*const {listPage: {pageIndex, pageSize}, labId} = this.state;
    this.getRecipePageListByLabId({pageIndex, pageSize, id:labId});*/
  }

  _getAllListQuery = (pageQuery = {})=>{
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      //if((values.startTime)!= null){
      //values.startTime = moment(values.startTime).unix()*1000;
      // }
      _f = { ...values};
    });

    if(pageQuery.id === ''){
      delete pageQuery.id; //删除json下指定的元素。
    }
    //console.log('参数:', pageQuery);
    // step1 获取所有查询参数
    return {
      ..._f,
      ...pageQuery
    }
  };

  /*
   * @interface 查询实验室，已选的套餐。
   * */
  getRecipePageListByLabId = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    fetch('labRecipe/listByLabId', {
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
  //------------------------------------------------------------

  //----------------- start 选中行------------------------------------------------
  /*
   * @interface Grid  1.行更新
   * */
  handleGridRowsUpdated = ({fromRow, toRow, updated })=> {
    let rows = this.state.rows;

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
      rows[i] = updatedRow;
    }

    this.setState({ rows });
  };

  /*
   * @interface 2.选中行接口
   * @param {Array} 选中的行
   * */
  onRowsSelected = (rows ) =>{ /*新增选择的行*/
    //console.log('选中行接口', rows);
    this.setState( {
      selectedIds: rows.map(r => r.row[this.props.rowKey])
    });
    this.setState({
      selectedRows: rows.map(r => r.row)
    });
  };

  /*
   * @interface 3.取消选中行接口
   * @param {Array} 取消选中的行
   * */
  onRowsDeselected = (rows /*取消选择的行*/) =>{
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({
      selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )
    });
    this.setState({
      selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )
    });
  };

  /**
   * @interface 4.选行--中接口
   * */
  onRowClick = (rowIdx, clickedRow)=>{
    // case1. 如果是全选操作，跳过会自动调用onRowsSelected方法，如果是单选操作请隐藏全选checkbox视图操作
    if(rowIdx === -1){
      return;
    }
    // case2. 不是全选操作
    const hasSelected =  this.state.selectedRows.some((item)=>{
      return item[this.props.rowKey] === clickedRow[this.props.rowKey]
    });

    if(hasSelected){
      let rowIds = clickedRow[this.props.rowKey];
      //console.log('选中rowIds', rowIds );
      this.setState({
        selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )
      });
      this.setState({
        selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )
      });
    }else{
      // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
      this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
      this.setState({selectedRows: [clickedRow]});
    }
  };
  //------------------ end -------------------------------------------

  //------------------- 查询当前机构所拥有的所有实验室 ----------------
  getLabTypleList = (query)=>{
    const _q = query;
    // step1. 请求列表数据
    fetch('lab/list', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        // -------------------------------------------------------------------------
        // case1.获取机构的第一个实验室。
        const labId = listPage.rows.length > 0 ? listPage.rows[0]['id'] : '';
        this.setState({
          labList: listPage.rows,
          labId: labId,
        });
        // step2. 查询分页列表。
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getRecipePageListByLabId({pageIndex, pageSize, id:labId});

      },
      error: (err)=>{
        message.error(err.message||'响应失败！');
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
   * @interface 显示添加对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  addRecipeClick = ({type,  data: selectedRows = []})=> {
    const { labId} = this.state;
    if (type === 'add' && labId !== '') {
      this.showRecipeModal({
        data: {labId},
      });
    }else{
       message.error('请先选择一个实验室！');
    }
  }
  showRecipeModal = ({data})=>{ //显示查看对话框
    this.setState(({addLabAndRecipeModal})=>{
      return {
        addLabAndRecipeModal: {
          ...addLabAndRecipeModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenRecipeModal = ()=>{ //隐藏查看对话框
    this.setState(({addLabAndRecipeModal})=>{
      return {
        addLabAndRecipeModal: {
          ...addLabAndRecipeModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addLabAndRecipeCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenRecipeModal();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      //console.log(info);
      const {listPage: {pageIndex, pageSize},labId} = this.state;
      this.getRecipePageListByLabId({pageIndex, pageSize, id:labId});
      this.hiddenRecipeModal();
      return;
    }
  };
  //---------------------------------------- end 选套餐----------------------------------------------


  //-----------------------------------------------start 删除订单--------------------------------
  /*
   * @interface 删除一条通知记录
   * */
  delOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      // s1-case1. 只选中一条订单并且订单的状态为未提交status 0
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要删除该记录？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          const {labId} = this.state;
          this.delOrder({recipeId: selectedRows[0][this.props.rowKey], labId:labId }, (err, res = {})=> {
            // 关闭对话框
            //resolve();
            if (err) {
              // case1. 删除失败
              message.error(err.message ||'删除记录失败');
            } else {
              // case2. 重置selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}, labId} = this.state;
              this.getRecipePageListByLabId({pageIndex, pageSize, id:labId})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }
  };
  delOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，删除记录。
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
  //---------------------------------- end 删除订单 -----------------------------------

  //----------------------- 查看详细Model ------------------------------------
  viewDetailClick = ({rowdata: selectedRows})=>{
    this.showViewDetailModal({data: {...selectedRows}});
  };
  showViewDetailModal = ({data})=>{ //显示查看对话框
    this.setState(({viewRecipeDetail})=>{
      return {
        viewRecipeDetail: {
          ...viewRecipeDetail,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewDetailModal = ()=>{ //隐藏查看对话框
    this.setState(({viewRecipeDetail})=>{
      return {
        viewRecipeDetail: {
          ...viewRecipeDetail,
          visible: false,
          data: {}
        }
      }
    })
  };
  viewDetailCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenViewDetailModal();
      return;
    }
  };


  //-------------------------------------- 条件查询 ----------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}, labId} = this.state;
    this.getRecipePageListByLabId({pageIndex: 1, pageSize, id:labId});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}, labId} = this.state;
    this.getRecipePageListByLabId({pageIndex: 1, pageSize, id:labId})
  };
  //---------------------------------------------------------------------------------

  //------------------------ 收起or展开搜索栏。--------------------------------------------------
  /*
   * @interface 点击条件查询 Button的回调
   * @param {string} 点击的expandForm的值bool取反。
   * */
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  /*
   * @interface 点击tabPane的回调
   * */
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('nameCn', {
            rules: false
          })(
            <Input  placeholder="套餐名称" />
          )}
        </Form.Item>

        <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
          <Button onClick={this.queryClick} type="primary" icon="search">
            查询
          </Button>
          <Button onClick={this.resetClick} icon="reload">
            重置
          </Button>
          <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
            展开 <Icon type="down" />
          </a>
        </ButtonContainer>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('nameCn', {
            rules: false
          })(
            <Input  placeholder="套餐名称" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('shortName', {
            rules: false
          })(
            <Input  placeholder="助记码" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('remark', {
            rules: false
          })(
            <Input  placeholder="临床意义" />
          )}
        </Form.Item>

        <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
          <Button onClick={this.queryClick} type="primary" icon="search">
            查询
          </Button>
          <Button onClick={this.resetClick} icon="reload">
            重置
          </Button>
          <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
            收起 <Icon type="up" />
          </a>
        </ButtonContainer>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }
  //---------------------------------------------------------------------------------------

  /*
   * @interface 点击的回调的实验室id
   * @param {string} 点击的value
   * */
  handleChange = (value)=>{
    //console.log(`selected ${value}`);
    this.setState({
      labId: value,
    });
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getRecipePageListByLabId({pageIndex, pageSize, id: value});
  }

  render() {
    const { form } =this.props;
    const { getFieldDecorator } = form;
    const { listPage: {pageIndex, pageSize, rows:dataSource, total},
      spinning,tip,tableLoading,selectedIds,selectedRows, addLabAndRecipeModal, viewRecipeDetail,
      labList= [], labId,} = this.state;

    //----------------------- 动态参数 ----------------------------------------
    let labType =[], lisType=[];
    labType = searchTextByValues('lab_type');//实验室类型模块---匹配字典表。
    lisType = searchTextByValues('lis_type');//lis类型模块---匹配字典表。


    const _columns = [
      {
        name: '序号',
        key: 'index',
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
        name: '操作',
        key: 'operation',
        width: 100,
        sortable: false,
        formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
          return (
            <div>
              <span onClick={this.viewDetailClick.bind(this, {rowdata: dependentValues})}><a>查看套餐详细</a></span>
              {/*<Divider type="vertical" />
               <ButtonContainer>
               <Button
               type="primary"
               onClick={this.viewPOCTBoxClick.bind(this, {dependentValues})}> 查看模块</Button>
               <Button
               type="primary"
               onClick={this.addPOCTBoxModuleClick.bind(this, {dependentValues})}>添加模块</Button>
               <Button
               type="danger"
               onClick={this.delPOCTBoxModuleClick.bind(this, {dependentValues})}>删除模块</Button>
               <Button
               type="primary"
               onClick={this.updataPOCTBoxModuleClick.bind(this, {dependentValues})}>修改模块</Button>
               </ButtonContainer> */}
            </div>
          )
        },
      },
      /*{
       name: '操作',
       key: 'operation',
       width: 150,
       sortable: false,
       formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
       return (
       <div>
       <Button
       type="primary"
       //onClick={this.viewLabDetailClick.bind(this, {rowdata: dependentValues})}
       size='small'>查看详细 </Button>
       <Divider type="vertical" />
       </div>
       )
       },
       },*/
      {
        name: '套餐名称',
        key: 'nameCn',
        width: 200,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '助记码',
        key: 'shortName',
        width: 150,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value }</span>
          )
        },
      },
      {
        name: '临床意义',
        key: 'remark',
        width: 700,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        },
      },
    ]

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
        this.getRecipePageListByLabId({pageIndex: current, pageSize, id:labId})
      }
    };


    return (
      <PageHeaderLayout>
        <div style={{marginTop: -20,}}>
          <div className="hidden">
            <AddLabAndRecipeModal {...addLabAndRecipeModal} callback={this.addLabAndRecipeCallback}/>
            <ViewRecipeDetail {...viewRecipeDetail} callback={this.viewDetailCallback}/>
          </div>

          <Card bordered={false}>
            {/* 1.查询栏 */}
            <div style={{marginTop: -20, marginBottom:-5}}>
              {/* a.实验室 */}
              <div style={{float:'left',marginTop: 4,marginRight: 10,}}>
                <span style={{fontWeight:800,fontSize:17,}}>实验室&nbsp;:&nbsp;</span>
                <Select
                  showSearch={false}
                  allowClear={false}
                  style={{ width: 200 }}
                  value={labId !== ''? labId : ''} // 指定下拉列表框中默认选中第一项。
                  placeholder="请先选一个实验室"
                  multiple={false}
                  combobox={false}
                  optionFilterProp="children"
                  labelInValue={false}
                  tokenSeparators={null}
                  //onChange={this.handleChange} 即使是清空也会触发这个属性。
                  onSelect={this.handleChange}
                >
                  {labList.map((item)=>{
                    return (
                      <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                    )
                  })}
                </Select>
                <Divider type="vertical" style={{width:2,height:26,background:'#fd0202'}}/>
              </div>
              {/* b.条件查询 */}
              {this.renderForm()}
            </div>

            <ButtonContainer>
              <Button onClick={this.addRecipeClick.bind(this, {type: 'add', data:{}})}  type="primary"  icon="plus">添加套餐</Button>
              <Button onClick={this.delOrderClick.bind(this, {data: selectedRows})} type="danger" icon="close">删除</Button>
            </ButtonContainer>
            <Spin
              spinning={spinning}
              tip={tip}>
              <GridTable
                tableLoading={tableLoading}
                dataSource={dataSource}
                columns={_columns}
                onGridRowsUpdated={this.handleGridRowsUpdated}
                enableRowSelect={true}
                onRowClick = {this.onRowClick}
                rowSelection={
                                        {
                                            showCheckbox: true,
                                            enableShiftSelect: false,
                                            onRowsSelected: this.onRowsSelected,
                                            onRowsDeselected: this.onRowsDeselected,
                                            selectBy:{  keys:{rowKey:'id', values:this.state.selectedIds} }
                                        }
                                  }
                rowHeight={36}
                minHeight={420}
                rowScrollTimeout={0}
                onGridSort={this.handleGridSort}
                pagination={_pagination}
                //scroll={{x: 950}}               //横向可滚动距离
              />
          </Spin>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

Recipe.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
Recipe.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

Recipe = Form.create({})(Recipe);

export default Recipe;
