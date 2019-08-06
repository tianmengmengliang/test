/**
 * Created by jpt on 2018/5/25 0025.
 */
import React, { Component,  } from 'react';
import PropTypes from 'prop-types';
import {Form, Select, Upload, Tooltip, Icon, Cascader, Input, DatePicker,Alert,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox,Modal,Table } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
import style from '../project/Project.less'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, } from '../../../../compoents2/';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表

class AddAdviceSaveModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      confirmLoading: false,
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState();
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
    const {data={},visible,nameCn,nameEn,remark,shortName,unit,medicareCode} = this.props;
    const project = data.rows;
    const _columns = [
      {
        title: '序号',
        key: 'sn' ,
        width: 50,
        render: (value, record, i)=>{
          return i+1
        }
      },{
        title: '性别',
        dataIndex: 'sex',
        key: 'sex' ,
        width: 100,
        render: (value, record, i)=>{
          let sex2 = "";
          if(value==1){sex2 = "男";}else{sex2 = "女";}
          return (
            <span>{sex2}</span>
          )
        }
      },{
        title: '最大年龄',
        dataIndex: 'ageMax',
        key: 'ageMax' ,
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '最小年龄',
        dataIndex: 'ageMin',
        key: 'ageMin' ,
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '参考区间',
        dataIndex: 'referenceRange',
        key: 'referenceRange' ,
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '参考值',
        dataIndex: 'referenceValue',
        key: 'referenceValue' ,
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '最小值',
        dataIndex: 'minValue',
        key: 'minValue' ,
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '最大值',
        dataIndex: 'maxValue',
        key: 'maxValue' ,
        width: 150,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      }
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
          <h2 style={{textAlign: 'center'}}>项目详情</h2>
          <table className={style.table} style={{width:930}} border="1">
            <tBody>
            <tr height="45">
              <td className={style.trBackground}>
                <div>医嘱中文名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{nameCn}</div>
              </td>
              <td className={style.trBackground}>
                <div>医嘱英文名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{nameEn}</div>
              </td>
              <td className={style.trBackground}>
                <div>医保编号</div>
              </td>
              <td className={style.trBackground2}>
                <div>{medicareCode}</div>
              </td>
            </tr>
            <tr height="45">
              <td className={style.trBackground}>
                <div>简称</div>
              </td>
              <td className={style.trBackground2}>
                <div>{shortName}</div>
              </td>
              <td className={style.trBackground}>
                <div>单位</div>
              </td>
              <td className={style.trBackground2} colspan="3">
                <div>{unit}</div>
              </td>
            </tr>
            <tr height="75">
              <td className={style.trBackground}>
                <div>备注</div>
              </td>
              <td className={style.trBackground2} colspan="5">
                <div>{remark}</div>
              </td>
            </tr>
            </tBody>
          </table>
          <br/>
          <h2 style={{textAlign: 'center'}}>项目详细列表</h2>
          <div>
            <Table
              bordered
              columns={_columns}
              dataSource={project}
            />
          </div>
        </div>
      </ModalA>
    )
  }
}

export default AddAdviceSaveModal;
