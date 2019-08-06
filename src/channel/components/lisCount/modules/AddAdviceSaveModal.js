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
import style from '../advice/Advice.less'
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
    const {data={},visible,nameCn,nameEn,remark,type} = this.props;
    let type2 = "";
    if(type==0){type2 = "常规";}else if(type==1){type2 = "生化";}else if(type==2){type2 = "免疫";}
    console.log("------data:",data);

    const yizhu = data.rows;
    const _columns = [
      {
        title: '序号',
        key: 'sn' ,
        width: 50,
        render: (value, record, i)=>{
          return i+1
        }
      },{
        title: '项目中文名',
        dataIndex: 'nameCn',
        key: 'nameCn' ,
        width: 50,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '项目英文名',
        dataIndex: 'nameEn',
        key: 'nameEn' ,
        width: 50,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '医保编号',
        dataIndex: 'medicareCode',
        key: 'medicareCode' ,
        width: 50,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '简称',
        dataIndex: 'shortName',
        key: 'shortName' ,
        width: 50,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '单位',
        dataIndex: 'unit',
        key: 'unit' ,
        width: 50,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
      },{
        title: '备注',
        dataIndex: 'remark',
        key: 'remark' ,
        width: 50,
        render: (value, record, i)=>{
          return (
            <span>{value}</span>
          )
        }
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
          <h2 style={{textAlign: 'center'}}>医嘱详情</h2>
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
                <div>医嘱类型</div>
              </td>
              <td className={style.trBackground2}>
                <div>{type2}</div>
              </td>
            </tr>
            <tr height="65">
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
          <h2 style={{textAlign: 'center'}}>医嘱项目详细列表</h2>
          <div>
            <Table
              bordered
              columns={_columns}
              dataSource={yizhu}
            />
          </div>
        </div>
      </ModalA>
    )
  }
}

export default AddAdviceSaveModal;
