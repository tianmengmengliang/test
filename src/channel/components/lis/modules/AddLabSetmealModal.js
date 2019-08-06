/**
 * Created by jpt on 2018/6/20 0020.
 */
/**
 * Created by jpt on 2018/5/15 0015.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Checkbox, Button, Select, Radio, Upload, Icon, Input, DatePicker, Modal,
  Popconfirm, InputNumber, message,} from 'antd'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {AddSetmealAndDoctorModal,} from './modules/'
import {searchTextByValues}  from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
function noop(){}
//拖拽表组件。----------------------------------------------------------------------------------------------------
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

function dragDirection(dragIndex, hoverIndex, initialClientOffset,clientOffset, sourceClientOffset ) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;

  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      dragRow,
      clientOffset,
      sourceClientOffset,
      initialClientOffset,
      ...restProps
      } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver && initialClientOffset) {
      const direction = dragDirection(
        dragRow.index,
        restProps.index,
        initialClientOffset,
        clientOffset,
        sourceClientOffset
      );
      if (direction === 'downward') {
        className += ' drop-over-downward';
      }
      if (direction === 'upward') {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};
const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow)
);
//----------------------------------------------------------------------------------------------------------------------

/**
 * 添加套餐/修改套餐
 *  作者: jpt
 * */
class AddLabSetmealModal extends Component{
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
      addDoctorModal: {                            // 新建
        title: '',
        visible: false,
        data: {}
      },
    }
  };

  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { listPage: {rows} } = this.state;
    let data = rows;
    const dragRow = data[dragIndex];
    this.setState(//数据重组。
      update(this.state, {
        listPage: {rows: { $splice: [[dragIndex, 1],  [hoverIndex, 0, dragRow]],}},
        //data: { $splice: [[dragIndex, 1],  [hoverIndex, 0, dragRow]],},
      })
    );
  }

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

  //--------------------------------end列表----------------------
  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
      //console.log('--componentWillReceiveProps时期----', newData.selectedRows);
      if(newData.selectedRows !== undefined ) {
        let _selectedRowKeys = [], _selectedRows = [];
        _selectedRows = newData.selectedRows;
        _selectedRows.map((item)=> {
          _selectedRowKeys.push(item.id);
        })
        this.setState({
          selectedRowKeys: _selectedRowKeys,  //用户修改操作: 用于赛选的标志
          listPage: {rows: _selectedRows}      //用户修改操作：已选中的项目
        })
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



  // 提交医嘱表单。
  onOk = ({data: arrSelectIds,  selectedRows} )=> {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        message.error(err.message||'未选择完全')
        return;
      }
      else if ( arrSelectIds.length > 0 ) {
        console.log('选中医嘱:', selectedRows );
        const _selectedRows= [];
        selectedRows.forEach((key)=>{ _selectedRows.push({doctorAdviceId: key.id});});
        //join --> string
        //['id','name','remark','sampleTypeId','type'].forEach((key)=>{ doctorAdvice[key] = values[key];});
        const fpData = {
          ...values,
          recipeDetails: _selectedRows,
        }
        //console.log('保存:', fpData );

        fetch('labRecipe/save', {
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
            message.error( err.message||`，保存数据失败`)
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

  //---------------- 1.仪器类型列表请求接口 --------------------
  getDevicesList = (selectedId={}, callback = ()=>{})=>{
    fetch('deviceType/list', {
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
          title: '请求中...'
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

  //------------------- start 选项目对话框-----------------
  addProject = ({type,  data: selectedRows=[]})=>{
    console.log('选的type:', type );
    if(type === 'add') {
      this.showAdd({data: {}});
    }
  };
  showAdd = ({data})=>{
    this.setState(({addDoctorModal})=>{
      return {
        addDoctorModal: {
          ...addDoctorModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addDoctorModal})=>{
      return {
        addDoctorModal: {
          ...addDoctorModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addDoctorCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
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
      //1.合并。
      const { selectedRowKeys=[], listPage:{ rows=[] } } = this.state;

      let _selectedIds = selectedRowKeys.concat( SelectIds);
      let _selectedRows = rows.concat( selectedRows);
      console.log('合并结果', _selectedRows);

      //2.去除重复。
      let _selectedIds2=[],  temp = {},_selectedRows2 = [];//最后的新数组;
      _selectedIds.map((item)=>{ //从这里开始匹配，如果没有匹配到，
        if(_selectedIds2.indexOf(item)<0){ _selectedIds2.push(item);}
      });

      _selectedRows.map((item,index)=>{
        if(!temp[item.id]){ //取反不重复。
          //判断的标志
          _selectedIds2.map((key)=>{
            if(item.id === key){
              _selectedRows2.push(item);
              temp[item.id] = true
            }
          })
        }
      });
      console.log('合并去除重结果', _selectedRows2);

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
          listPage: { rows: _selectedRows},
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
    const {confirmLoading, listPage: {rows: dataSource, },
      tableLoading, spinning, tip, selectedRowKeys, addDoctorModal, devicesType,} = this.state;
    const selectedRows = dataSource;
    //console.log('selectedRows:',selectedRows);
    //console.log('data:', data);

    //----------------------- 动态参数 ----------------------------------------
    const {doctorDviceType =[], sampleType =[],} = data;
    let reportTimeType =[], priorityType =[];
    /*--------- 遍历 医嘱类型 -----------*/
    const _Select1 = doctorDviceType.map((k)=>{
      let value = Number(k.value);
      return ( <Select.Option value={value} key={k.id}>{k.text}</Select.Option>  );
    });
    /*--------- 遍历 样本类型 -----------*/
    const _Select2 = sampleType.map((k)=>{
      return ( <Select.Option value={k.id} key={k.id}>{k.name}</Select.Option>  );
    });
    /*--------- 遍历 优先级类型 -----------*/
    priorityType = searchTextByValues('priority');
    const _Select4 = priorityType.map((k)=>{
      return ( <Select.Option value={k.value} key={k.id}>{k.text}</Select.Option>  );
    });

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    };
    const formItemLayout2 = {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
    };
    const formItemLayout4 = {
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
          <Col span={6}><Form.Item
            label="中文名称"
            {...formItemLayout}
          >
            {getFieldDecorator('nameCn', {
              initialValue: data.nameCn,
              rules: [{required: false,  message:'请输入中文名称' },]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入名称`}
              />
            )}
          </Form.Item></Col>
          <Col span={6}><Form.Item
            label="助记码"
            {...formItemLayout2}
          >
            {getFieldDecorator('shortName', {
              initialValue: data.shortName,
              rules: [{required: false,  message:'请输入助记码' },]
            })(
              <Input
                size="large"
                //style={{width: 300}}
                placeholder={`请输入助记码`}
              />
            )}
          </Form.Item></Col>
          <Col span={10}><Form.Item
            {...formItemLayout4}
            label="临床意义">
            {getFieldDecorator('remark', {
              initialValue: data.remark,
              rules: [
                { required: false, message:'请输入临床意义' }
              ],
            })(
              <Input
                size="large"
                placeholder="请输入临床意义"
              />
            )}
          </Form.Item></Col>
        </Row>

        <Row>
          <Col span={6}><Form.Item
            {...formItemLayout}
            label="优先级"
          >
            {getFieldDecorator('priority', {
              initialValue: data.priority,
              rules: [{
                required: false, message: '请选择优先级',
              }]
            })(
              <Select
                size="large"
                style={{width: '100%', marginRight: '3%' }}
                placeholder={`请选择`}
                allowClear={true}
                multiple={false}
                combobox={false}
                tags={false}
                showSearch={false}
                filterOption={false}
                optionFilterProp={`children`}
                labelInValue={false}
                tokenSeparators={null}
              >
                {_Select4}
              </Select>
            )}
          </Form.Item></Col>
          <Col span={6}> </Col>
          <Col span={4}><div style={{marginTop:5,marginLeft:'40%'}}>
            <Button onClick={this.addProject.bind(this, {type:'add', data:{}})}  type="primary"  icon="plus">选择医嘱</Button>
          </div></Col>
        </Row>
      </div>
    );

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
          width={1000}
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={title}
          visible={visible}
          okText="确定"
          cancelText="取消"
          maskClosable
          onOk={this.onOk.bind(this, {data: selectedRowKeys, selectedRows} )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >
          { _data}

          <div className="hidden">
            <AddSetmealAndDoctorModal {...addDoctorModal} callback={this.addDoctorCallback}/>
          </div>

          <div style={{textAlign:'left',}}>(已选择医嘱)</div>
          {/*<Table
            className={styles['components-table-demo-nested']}
            loading={tableLoading}
            bordered
            rowKey={record => record.id}
            columns={_columns1}
            rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
            dataSource={dataSource}
          />*/}

          <Table
            loading={tableLoading}
            columns={_columns1}
            dataSource={dataSource}
            components={this.components}
            onRow={(record, index)=> ({index, moveRow: this.moveRow,})}
            pagination={false}
          />
        </ModalA>
      </div>
    )
  }
}

AddLabSetmealModal.propTypes = {
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

AddLabSetmealModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

AddLabSetmealModal = Form.create()(AddLabSetmealModal);
AddLabSetmealModal = DragDropContext(HTML5Backend)(AddLabSetmealModal);

export default AddLabSetmealModal;
