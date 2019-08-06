/**
 * Created by jpt on 2018/6/21 0021.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Form,Row, Col,Card, Table, Button,  Select, Upload, Icon, Input, DatePicker,
  Popconfirm, InputNumber, message, Alert, } from 'antd'
import styles from './style.less';
import moment from 'moment'
import cx from 'classnames'
import {fetch, CONFIG} from  '../../../../services/';
import ViewD5A5ListByLabId from './ViewD5A5ListByLabId';
import ViewRecipeByLabId   from './ViewRecipeByLabId';

import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable } from  '../../../../compoents2/';
import {searchTextByValues }      from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import {searchSampleTypeByValues} from 'antd/../../src/compoents2/location/SampleTypeList.js'; //匹配样本类型
function noop(){}

/**
 *  医嘱和 套餐的对话框
 */
class ViewLabDetailModal extends Component{
  _retInitialState = ()=>{
    return {
      labId: 0,                                             // 实验室id
      confirmLoading: false,                              // 对话框
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

  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
      //console.log('--componentWillReceiveProps时期--:', newData);
      if(newData!== undefined){
        this.setState({
          labId: newData.id,
        })
      }
    }
  }

  //-------------------- 表单提交 --------------------------------
  onOk = ()=> {
    /* 回调父组件的callback函数*/
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields();
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

  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, labId } = this.state;  //实验室id
    //console.log('labId:', labId);

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
          onOk={this.onCancel}
          onCancel={this.onCancel}
          {...props}
        >
          <div>
            <Alert message="已择医嘱" type="info" />
            <ViewD5A5ListByLabId  data={{labId: labId}} />
          </div>

          <div>
            <Alert message="已择套餐" type="info" />
            <ViewRecipeByLabId   data={{labId: labId}}/>
          </div>


        </ModalA>
      </div>
    )
  }
}

ViewLabDetailModal.propTypes = {
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

ViewLabDetailModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

ViewLabDetailModal = Form.create()(ViewLabDetailModal);

export default ViewLabDetailModal;
