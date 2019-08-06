/**
 * Created by Xuan on 2018/6/13.
 */
import React, { Component,  } from 'react';
import PropTypes from 'prop-types';
import {Form, Select, Upload, Tooltip, Icon, Cascader, Input, DatePicker,Alert,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox,Modal,Table } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
import style from './project.less'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, } from '../../../../compoents2/';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表

class ViewProjectDetailModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      confirmLoading: false,
      listPage: {
        pageIndex: 1,
        pageSize: 10,
        rows: [],
        total: 0
      },
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState()
  }

  componentDidMount(){
    this.init();
  }

  init(){

  }

  componentWillReceiveProps(nextProps){ //当组件传入的 props变化时调用，更新state。

  }

  onCancel = ()=> {
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    //this.props.form.resetFields();
  };

  render(){
    const {confirmLoading} = this.state;
    const {title,data={},visible,
      nameCn,deleteFlag,nameEn,medicareCode,remark,unit,shortName
      } = this.props;
    const project = data.rows;

    const _columns = [
      {
        title: '序号',
        key: 'sn' ,
        width: 100,
        render: (value, record, i)=>{
          return i+1
        }
      },{
        title: '最大年龄',
        dataIndex: 'ageMax',
        key: 'ageMax',
        width: 120,
        //sorter: true,
      },{
        title: '最小年龄',
        dataIndex: 'ageMin',
        key: 'ageMin',
        width: 120,
        //sorter: true,
      },{
        title: '性别',
        dataIndex: 'sex',
        key: 'sex',
        width: 100,
        //sorter: true,
        render: (value, record, i)=>{
          return (
            <span>{value==0 ? "男":"女"}</span>
          )
        }
      },{
        title: '最大参考值',
        dataIndex: 'maxValue',
        key: 'maxValue',
        width: 120,
        //sorter: true,
      },{
        title: '最小参考值',
        dataIndex: 'minValue',
        key: 'minValue',
        width: 120,
        //sorter: true,
      },{
        title: '参考范围',
        dataIndex: 'referenceRange',
        key: 'referenceRange',
        width: 200,
        //sorter: true,
      },{
        title: '标准参考值',
        dataIndex: 'referenceValue',
        key: 'referenceValue',
        width: 120,
        //sorter: true,
      },
    ];
    return (
      <ModalA
        confirmLoading={confirmLoading}
        visible={visible}
        onCancel={this.onCancel}
        footer=''
        // bodyHeight={500}
        maskClosable
      >
        <div>
          <h2 style={{textAlign: 'center'}}>项目内容</h2>
          <table className={style.table} style={{width:930}} border="1">
            <tBody>
            <tr height="35">
              <td className={style.trBackground}>
                <div>项目中文名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{nameCn}</div>
              </td>
              <td className={style.trBackground}>
                <div>项目英文名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{nameEn}</div>
              </td>
              <td className={style.trBackground}>
                <div>项目中文名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{deleteFlag}</div>
              </td>
            </tr>
            <tr height="55">
              <td className={style.trBackground}>
                <div>备注</div>
              </td>
              <td className={style.trBackground2} colSpan={5}>
                <div>{remark}</div>
              </td>
            </tr>
            </tBody>
          </table>

          <br/>
          <br/>

          <h2 style={{textAlign: 'center'}}>项目详细</h2>
          <div>
            <Table
              bordered
              columns={_columns}
              dataSource={project}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>
        </div>
      </ModalA>
    )
  }
}

export default ViewProjectDetailModal;
