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
import style from '../report/Report.less'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, } from '../../../../compoents2/';
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表

class AddReportSaveModal extends Component{
  _retInitialState= ()=>{ //状态。
    return {
      confirmLoading: false,
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
    const {confirmLoading,} = this.state;
    const {title,data={},visible,
      reportCode,patientCode,name,sex,age,deptName,idCard,createTime,createUserName,applyDoctorName,
      testDoctorName,auditDoctorName,diagnosis,checkTime,testTime,sampleType,sampleCode,deleteFlag,state,
      picturePathId,applyBillId,labCode,doctorAdviceName,sourceOrgId, } = this.props;


    let sex2;
    if(sex == 1){sex2 = "男";} else if(sex == 2){sex2 = "女";}
    const report = data.rows;

    const _columns = [
      {
        title: '序号',
        key: 'sn' ,
        width: 100,
        render: (value, record, i)=>{
          return i+1
        }
      },
      {
        title: '项目',
        dataIndex: 'nameEn',
        key: 'nameEn',
        width: 200,
        //sorter: true,
      },
      {
        title: '中文名称',
        dataIndex: 'nameCn',
        key: 'nameCn',
        width: 400,
        //sorter: true,
      },
      {
        title: '结果',
        dataIndex: 'result',
        key: 'result',
        width: 200,
        //sorter: true,
      },{
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 200,
        //sorter: true,
      },{
        title: '参考值',
        dataIndex: 'referenceValue',
        key: 'referenceValue',
        width: 200,
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
          <h2 style={{textAlign: 'center'}}>报告单基本信息详细</h2>
          <div>
            <div className={style.left}>报告单编号:{reportCode}</div>
            <div className={style.right}>病历号:{patientCode}</div>
          </div>
          <table className={style.table} style={{width:930}} border="1">
            <tBody>
            <tr>
              <td className={style.trBackground}>
                <div>病人姓名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{name}</div>
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
            <tr>
              <td className={style.trBackground}>
                <div>身份证号</div>
              </td>
              <td className={style.trBackground2}>
                <div>{idCard}</div>
              </td>
              <td className={style.trBackground}>
                <div>科室/部门名</div>
              </td>
              <td className={style.trBackground2}>
                <div>{deptName}</div>
              </td>
              <td className={style.trBackground}>
                <div>创建人</div>
              </td>
              <td className={style.trBackground2}>
                <div>{createUserName}</div>
              </td>
            </tr>
            <tr>
              <td className={style.trBackground}>
                <div>临床医生</div>
              </td>
              <td className={style.trBackground2} colSpan="2">
                <div>{applyDoctorName}</div>
              </td>
              <td className={style.trBackground}>
                <div>来源机构</div>
              </td>
              <td className={style.trBackground2} colSpan="2">
                <div>{sourceOrgId}</div>
              </td>
            </tr>
            <tr height="40">
              <td className={style.trBackground}>
                <div>临床诊断</div>
              </td>
              <td className={style.trBackground2} colSpan="5">
                <div>{diagnosis}</div>
              </td>
            </tr>
            <tr>
              <td className={style.trBackground}>
                <div>样本编号</div>
              </td>
              <td className={style.trBackground2}>
                <div>{sampleCode}</div>
              </td>
              <td className={style.trBackground}>
                <div>样本类型</div>
              </td>
              <td className={style.trBackground2}>
                <div>{sampleType}</div>
              </td>
              <td className={style.trBackground}>
                <div>实验室编号</div>
              </td>
              <td className={style.trBackground2}>
                <div>{labCode}</div>
              </td>
            </tr>
            </tBody>
          </table>
          <div>
            <div className={style.left}>
              报告时间:{moment(checkTime).format("YYYY-MM-DD HH:mm:ss")}&emsp;&emsp;&emsp;&emsp;送检时间:{moment(testTime).format("YYYY-MM-DD HH:mm:ss")}
            </div>
            <div className={style.right}>
              检验医生:{testDoctorName}&emsp;&emsp;&emsp;&emsp;审核医生:{auditDoctorName}
            </div>
          </div>

          <br/>
          <br/>

          <h2 style={{textAlign: 'center'}}>报告单项目详细</h2>
          <div>
            <Table
              bordered={false}
              columns={_columns}
              dataSource={report}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>
        </div>
      </ModalA>
    )
  }
}

export default AddReportSaveModal;
