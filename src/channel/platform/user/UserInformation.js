/**
 * Created by jpt on 2018/7/10 0010.
 */
/**
 * Created by jpt on 2018/5/10 0010.
 */
import React, { PureComponent, Fragment, Component, } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva'
import {Row, Col,Form, Card, Table, Tabs, Button, Input, message, Popconfirm, Divider, Cascader,
  Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
const TabPane = Tabs.TabPane;
import { GridTable, ButtonContainer, } from '../../../compoents2/';
import moment from 'moment'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch, CONFIG, fetchResource,} from '../../../services/'
import {searchTextByValues, } from 'antd/../../src/compoents2/location/DictionaryList.js'; //匹配字典表
import CropBlock from './crop/cropBlock.jsx';

//------------------ 怎么把Json数据 转成Json树状结构! -----------------------------
function fn(data, pid) {
  var result = [], temp;
  for (var i = 0; i < data.length; i++) {
    if (data[i].parentId == pid) {
      var obj = {'id': data[i].id,  'value': data[i].city,  'label': data[i].city, 'parentId': data[i].parentId };
      //----- 递归 -----------------
      temp = fn(data, data[i].id);
      if (temp.length >0){
        obj.children = temp;
      }
      result.push(obj);
    }
  }
  return result;
}
//-------------------------------------------------------------------------------
/**
 *
 * */
class UserInformation extends Component {

  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                             // 页面加载数据loading状态文字
      addLaboratoryModal: {                              // 新建实验室
        title: '实验室信息',
        visible: false,
        data: {}
      },
      activeKey: '1',
      residences: [],                                  //省市区
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
    this.getResidencesData((err, res)=> { //1、获取省市区
      if(err){
        message.warn(err.message || `省市区数据失败`);
        return;
      }
      const _data = res.responseObject;
      let dataSource = fn(_data, 0);  //---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历
      this.setState({
        residences: dataSource,
      })
    });
  }


  /**
   * 查询及请求参数。
   **/
  _getAllListQuery = (pageQuery = {})=>{
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }

      //声明容器
      let Paths= {};
      if(values.residence!== undefined){
        ['country','province','city','area'].forEach((key, index) =>{
          Paths[key] = values.residence[index];
        });
      }
      _f = {
        ...values,
        ...Paths,
      };
    });
    // step1 获取所有查询参数
    return {
      ..._f,
      ...pageQuery
    }
  };

  /*
   * @interface 获取实验室分页列表
   * */
  getDevicesTypleList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);
    // step2. 请求列表数据
    fetch('lab/list', {
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage } = res;
        //console.log("--响应数据:", listPage);
        this.setState({
          listPage
        });
      },
      error: (err)=>{
        message.error(err.message||'响应数据失败！');
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


  //--------------------------------------- 查询设备类型 ---------------------------------
  //1.查询省市区接口
  getResidencesData = ( callback=()=>{})=>{
    //fetch('area/list', {
    fetchResource('publics/china_map_data.js',{ //访问服务器静态文件。
      //method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...'
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          tip: ''
        })
      }
    })
  };

  /*
   * @interface 显示添加对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  add = ({type,  data: selectedRows = []})=>{
    if(type === 'add') {
      /***********************************/
      /*this.getResidencesData((err, res)=> { //1、获取省市区
       if(err){
       message.warn(err.message ||`省市区数据失败`);
       return;
       }
       const _data= res.responseObject;
       let dataSource = fn(_data, 0);*/  //---------- 省市区Json数据---> 树状结构 ------------//树形结构遍历
      /***********************************/
      const {residences} = this.state;
      this.showAdd({
        data: {
          residences: residences,
        }
      });

    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx( selectedRows);
      //case1. 只选中一行
      if (hasSelectedOnlyOneIdx) {
        const {residences} = this.state;
        this.showAdd({
          data: {
            ...selectedRows[0],
            residences: residences,
          }
        })
      }else{
        return;
      }
    }
  };
  showAdd = ({data})=>{
    this.setState(({addLaboratoryModal})=>{
      return {
        addLaboratoryModal: {
          ...addLaboratoryModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{ //@interface 隐藏订单对话框
    this.setState(({addLaboratoryModal})=>{
      return {
        addLaboratoryModal: {
          ...addLaboratoryModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addCallback = (info)=>{ //@interface 添加查验通知单对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd();
      return;
    }
    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      //console.log(info);
      this.resetSelectedRowsNIds();
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getDevicesTypleList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
  //-----------------------------------end 新增、修改-------------------------------------




  /*
   * @interface 点击tabPane的回调
   * @param {string} 点击的tabPane的key
   * */
  onTabClick = (tabPaneKey)=>{
    this.setState({
      activeKey: tabPaneKey,
    })
  };

  render() {
    const { form, ...props} =this.props;
    const { getFieldDecorator } = form;
    const { spinning,tip, addLaboratoryModal, activeKey, } = this.state;

    return (
      <PageHeaderLayout>
        <div style={{marginTop: -20,background:'#fff'}}>
          {/*<Card bordered={false}></Card>*/}
          <Tabs defaultActiveKey={activeKey} onChange={this.onTabClick} type="card" style={{fontSize: 16,marginLeft:10}}>
            {/* 1.实验室 */}
            <TabPane tab="&emsp;个人资料&emsp;"  key="1">
              <div className="hidden">
                {/*对话框  <AddLaboratoryModal {...addLaboratoryModal} callback={this.addCallback} /> */}
              </div>
              <Card bordered={false}>
              </Card>
            </TabPane>

            {/* 2.实验室 */}
            <TabPane tab="&emsp;修改头像&emsp;"  key="2">
              <CropBlock number={5} aspectRatio={1/1} url='/manage/manager/upload.do' uploadData={{"type": 'item'}} urlArr ={[]} />
            </TabPane>

            {/* 3. */}
            <TabPane tab="&emsp;修改密码&emsp;"  key="3">
            </TabPane>

            {/* 4. */}
            <TabPane tab="&emsp;账户安全&emsp;"  key="4">
            </TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}

UserInformation.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};
UserInformation.defaultProps = {
  prefix: 'yzh-d',
  rowKey: 'id'
};

UserInformation = Form.create()(UserInformation);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};
export default connect(mapStateToProps)(UserInformation);
