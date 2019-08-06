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
import style from '../application/Application.less'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, } from '../../../../compoents2/';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表

class AddApplicationSaveModal extends Component{
  _retInitialState= ()=>{ //用于状态的重置。
    return {
      confirmLoading: false,
      listSampleType:[],
      listDic:[]
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
    fetch('sampleType/list', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        this.setState({
          listSampleType: res.responseObject
        })
      },
      error: (err)=>{
        // step1.
        message.error(err.message);
      },
    });
    fetch('dic/list', {
      // method: 'post',
      // headers: {},
      data: {
        name:"doctor_advice_type"
      },
      success: (res)=>{
        this.setState({
          listDic: res.responseObject
        })
      },
      error: (err)=>{
        // step1.
        message.error(err.message);
      },
    })
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
    const {confirmLoading, listSampleType=[],listDic=[]} = this.state;
    const {title,data={},visible,
      clinicalDoctor,code,outpatientCode,sex,age,labCode,testDoctor,diagnosis
      ,source,applyTime,patientName} = this.props;
    //console.log("data:2222222",data);

    let sex2;
    if(sex == 1){
      sex2 = "男";
    } else if(sex == 2){sex2 = "女";}

    const yizhu = data.rows;
    const _columns = [
      {
        title: '序号',
        key: 'sn' ,
        width: 50,
        render: (value, record, i)=>{
          return i+1
        }
      },
      {
        title: '检验项目中文名',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 200,
        //sorter: true,
      },
      {
        title: '检验项目英文名',
        dataIndex: 'nameEn',
        key: 'nameEn',
        width: 200,
        //sorter: true,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: 300,
        //sortable: true,
      },
      {
        title: '样本名称',
        dataIndex: 'sampleTypeId',
        key: 'sampleTypeId',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          const sampleType = listSampleType[value-1];
          return (
            <span>{sampleType.name}</span>
          )
        }
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        sortable: false,
        render: (value, record, i)=>{
          const dic_list = listDic[value];
          //<span>{dic_list.text!== undefined ? dic_list.text : ''}</span>
          return (
            <span>{dic_list.text!== undefined ? dic_list.text : ''}</span>
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
          <h2 style={{textAlign: 'center'}}>申请单详细</h2>
          <div>
            <div className={style.left}>申请单编号:{code}</div>
            <div className={style.right}>门诊号:{outpatientCode}</div>
          </div>
          <table className={style.table} style={{width:930}} border="1">
            <tBody>
            <tr height="45">
              <td className={style.trBackground}>
                <div>病人姓名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{patientName}</div>
              </td>
              <td className={style.trBackground}>
                <div>性别</div>
              </td>
              <td className={style.trBackground2}>
                <div>{sex2}</div>
              </td>
              <td className={style.trBackground}>
                <div>年龄</div>
              </td>
              <td className={style.trBackground2}>
                <div>{age}</div>
              </td>
            </tr>
            <tr height="45">
              <td className={style.trBackground}>
                <div>检验者</div>
              </td>
              <td>
                <div>{testDoctor}</div>
              </td>
              <td className={style.trBackground}>
                <div>实验室编号</div>
              </td>
              <td>
                <div>{labCode}</div>
              </td>
              <td className={style.trBackground}>
                <div>申请单来源his厂家</div>
              </td>
              <td>
                <div>{source}</div>
              </td>
            </tr>
            <tr height="70">
              <td className={style.trBackground}>
                <div>临床诊断</div>
              </td>
              <td colspan={5}>
                <div>{diagnosis}</div>
              </td>
            </tr>
            </tBody>
          </table>
          <div>
            <div className={style.left}>申请医生:{clinicalDoctor}</div>
            <div className={style.right}>申请时间:{moment(applyTime).format("YYYY-MM-DD HH:mm:ss")}</div>
          </div>
          <br/><br/><br/>
          <h2 style={{textAlign: 'center'}}>医嘱</h2>
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

export default AddApplicationSaveModal;
