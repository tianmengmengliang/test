/**
 * module desc
 * @module tms/module/DeviceDataModal
 * @author lh
 * @since 2017-08-01
 * @version x.x.x
 * */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tree, Row, Col, Button, Modal, Breadcrumb, Table, message,
  Radio, Tabs, Icon, Form, DatePicker, InputNumber, Spin, Alert } from 'antd';
import moment from 'moment';
import cx from 'classnames';
import Profiles from '../../../profiles';
import { fetch } from '../../../../services/'
import { ButtonContainer, SearchButton, ResetButton } from '.bin/../../src/components/'

/**
 * noop控操作函数
 * @function noop
 * */
function noop(){}

/**
 * some desc
 * @class ModalComponentTemplate
 * @extends Component
 * */
class ModalComponentTemplate extends Component {

  propTypes={
    prefix: PropTypes.string.isRequired,
    cssPrefix: PropTypes.string.isRequired,
    data:PropTypes.any,
    visible:PropTypes.bool.isRequired,
    callback:PropTypes.func
  };

  defaultProps = {
    prefix: Profiles.PREFIX,
    cssPrefix: 'modal-components-template',
    data: {}
  };

  /**
   * 根据组件props返回初始化state对象
   * @member _retInitialState
   * @params {object} props - 组件的属性对象
   * @returns {object} 返回初始化state对象
   * @private
   * */
  _retInitialState = (props = {}) => {
    return {
      spinning: false,
      tip: '',
      initialDataStatus: '',
      listPageStatus: '',
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
      selectedIds: [],
      selectedRows: [],
    }
  };

  /**
   * ModalComponentTemplate的构造函数
   * @constructs
   * @params {object} props - 组件的属性对象
   * */
  constructor(props) {
    super(props);
    this.state = this._retInitialState(props)
  }

  /**
   * 组件渲染完成之后的生命周期方法
   * @member componentDidMount
   * */
  componentDidMount() {

  }

  /**
   * 组件渲染接受到新的属性的生命周期方法
   * @member componentWillReceiveProps
   * @params {object} nextProps - 新的属性对象
   * */
  componentWillReceiveProps(nextProps){
    /**
     * @constant {boolean} visible
     * @constant {object} data
     * */
    const { visible, data: newData = {} } = nextProps;
    const {data: oldData = {} } = this.props;

    if(newData !== oldData) {

    }
  }

  /*
   * 获取所有查询参数
   * @member _getAllListQuery
   * @param { object } pageQuery - 分页查询对象
   * @return {object} 列表所有查询条件参数对象
   * @access private
   * */
  _getAllListQuery = (pageQuery = {})=>{
    let _values = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      _values = values;
    });

    let _f = {
      ..._values
    };

    return {
      ..._f,
      ...pageQuery
    }
  };

  /**
   * 根据一段时间获取设备数据xhr
   * @member getDeviceRowsDataListPage
   * @params { object } data - 查询参数对象
   * @params { function | null } callback - 回调函数
   * */
  getListPage = (data = {}, callback = null) =>{
    fetch('', {
      // method: 'post',
      // headers: {},
      data: data,
      success: (res)=>{
        callback && callback(null, res);
      },
      error: (err)=>{
        callback && callback(err, null);
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...',
        });
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: '',
        });
      }
    })
  };

  /**
   * 获取设备报警设置页面列表数据action
   * @member getListPageClick
   * @params { object | undefined } query - 额外传入的查询参数
   * @params { function | undefined } callback - 回调函数
   * */
  getListPageClick = (query, callback)=>{
    /**
     * @constant { object } _q - 表单获取查询字段和自定义字段
     * @constant { object } params - 查询参数对象
     * */
    const _q = this._getAllListQuery(query);
    const params = {
      ..._q,
    };
    this.getListPage(params, (err, res) => {
      if(err) {
        message.error(err.message || '获取设备数据失败');
        return;
      }

      const { responseObject = {} } = res;
      this.setState({

      });

      callback && callback(err, res)
    });
  };

  /**
   * 重置查询表单
   * @member resetFormFields
   * */
  resetFormFields = () => {
    this.props.form && this.props.form.resetFields();
  };

  /**
   * DeviceDataModal对话框点击确定按钮的事件处理函数
   * @member handleOk
   * */
  handleOk=() =>{

  };

  /**
   * ModalComponentTemplate对话框点击取消按钮的事件处理函数
   * @member handleCancel
   * @params {object} e - 事件对象
   * */
  handleCancel=(e) =>{
    this.setState(this._retInitialState());
    this.props.form && this.props.form.resetFields();
    this.props.callback&&this.props.callback({cancel:true})
  };

  /**
   * 组件渲染的生命周期方法
   * @member render
   * @returns {React.elements} React.element对象
   * */
  render() {
    /**
     * @constant { string } prefix - 组件前缀
     * @constant { string } cssPrefix - 组件css前缀
     * @constant { object } deviceTypeDef - 设备类型定义数据结构
     * */
    const { prefix, cssPrefix, data: deviceTypeDef = {}, className, style,
      visible } = this.props;

    /**
     * @constant {function} getFieldDecorator
     * */
    const { getFieldDecorator} = this.props.form;

    /**
     * @constant {boolean} visible
     * @constant {boolean} spinning
     * @constant {string} tip
     * */
    const { spinning, tip } = this.state;

    return (
      <Modal
        width={1120}
        title={``}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        footer={[
          <Button key="back" type="ghost" size="large" onClick={this.handleCancel.bind(this)}>
            关 闭
          </Button>
        ]}
      >
        <Spin
          spinning={spinning}
          tip={tip}>

        </Spin>
      </Modal>
    )
  }
};

/**
 * ModalComponentTemplate
 * @exports ModalComponentTemplate
 * @default
 * */
export default Form.create()(ModalComponentTemplate);
