/**
 * Created by jpt on 2018/5/15 0015.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form, Select, Upload, Icon, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message,} from 'antd'
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
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,                                     // 第几页。
        pageSize: 20,                                     // 每页显示的记录条数。
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
      selectedIds: [],
      selectedRows: [],
    })
  };

//--------- start 查询ProjectIds分页列表接口 --------------------------
  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getProjectIdsList({pageIndex, pageSize});
  };

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
    const _q = this._getAllListQuery(query); //q是分页参数
    // step1. 请求列表数据
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
        message.error(err.message ||'projectIds分页列表接口报错');
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
//--------------------------------end列表-----------------------------


  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
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

  /*
   * @interface 保存选中行接口
   * */
  onRowsSelected = (rows /*新增选择的行*/) =>{
    /* 1.复选操作。*/
    this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
    this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});
    /* 2.单选操作。
     this.setState({ selectedIds: rows.map(r => r.row[this.props.rowKey]) });
     this.setState({ selectedRows: rows.map(r => r.row)  }); */
  };

  /*
   * @interface 取消选中行接口
   * */
  onRowsDeselected = (rows /*取消选择的行*/) =>{
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
    this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )});
  };

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
      this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )});
      this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )});
    }else{
      // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
      this.setState({selectedIds: this.state.selectedIds.concat([clickedRow[this.props.rowKey]])});
      this.setState({selectedRows: this.state.selectedRows.concat([clickedRow])});
    }
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



  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading,
      spinning, tip, selectedIds, selectedRows} = this.state;
    //console.log('selectedRows:',selectedRows);

    //----------------------- 动态参数 ----------------------------------------
    const {arrTypeGroup=[{id: 1, nameCn:'类型1'},{id: 2, nameCn:'类型2'}], } = data;
    /*--------- 遍历 -----------*/
    const _Select = arrTypeGroup.map((k)=>{
      return ( <Select.Option value={k.id} key={k.id}>{k.nameCn}</Select.Option>  );
    });

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };
    const _data = (<div style={{marginTop:-40,}}>
      <Form.Item
        {...formItemLayout}
        style={{display: 'none'}}
      >
        {getFieldDecorator('id', {  //申请类别(1,2,3)
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
    return (
      <div>
        <ModalA
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={title}
          visible={visible}
          okText="确定"
          cancelText="取消"
          onOk={this.onOk.bind(this, {data: selectedIds, selectedRows} )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >
          { _data}
          <div style={{color:'#f00',textAlign:'left',}}>(*请谨慎选择项目)</div>
          <GridTable
            tableLoading={tableLoading}
            //enableCellSelect={true}
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
                                    selectBy:{  keys:{rowKey:'id', values: this.state.selectedIds} }
                                }
                              }
            rowHeight={36}
            minHeight={400}
            // rowRenderer={RowRenderer}
            rowScrollTimeout={0}
            onGridSort={this.handleGridSort}
            pagination={_pagination}
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
