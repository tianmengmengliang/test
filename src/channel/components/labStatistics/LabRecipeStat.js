/**
 * Created by jpt on 2018/7/17 0017.
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Card, Form, Input, message, Popconfirm, Divider, Select, Button, notification, Modal,
  Tabs, Table, Radio, DatePicker, Tooltip, Menu, Dropdown } from 'antd';
import numeral from 'numeral';
import moment from 'moment'
import { ButtonContainer, SingleLineChart } from '../../../compoents2/';
import { ChartCard, yuan, MiniArea, MiniBar, MiniProgress, Field, Bar, Pie, TimelineChart,} from '../../../components/Charts';
import Trend  from '../../../components/Trend';
import NumberInfo from '../../../components/NumberInfo';
import { getTimeDistance } from '../../../utils/utils';
import styles from './Analysis.less';
import {fetch, } from '../../../services/';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const rankingListData = [];
for (let i = 0; i < 7; i += 1) {
  rankingListData.push({
    title: `工专路 ${i} 号店`,
    total: 323234,
  });
}

@connect(state => ({
  chart: state.chart,
}))

@Form.create()
/**
 * 业务趋势统计
 *
 * */
export default class LabRecipeStat extends Component {
  state = {
    loading: true,
    salesType: 'all',
    timeUnit: 'year',                          //时间单位。
    salesData: [],                              //统计数据。
    activeKey: '1',                            //激活的tabPane的key，
    currentTabKey: '',                         //激活的tabPane的key，
    rangePickerValue: [],                      //日期段。

    labList: [],                                //所有实验室列表。
    labCode: '',                                //下拉列表中的实验室。
  }

  componentDidMount() {
    //step.1 加载所有实验室。
    this.setState({ loading: false });
    this.getLabTypleList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    //dispatch({
    //  type: 'chart/clear',
    //});
  }

  handleChangeSalesType = (e) => {
    this.setState({
      salesType: e.target.value,
    });
  }

  handleTabChange = (key) => {
    this.setState({
      currentTabKey: key,
    });
  }



  //--------------- start 查询所有的实验室接口-------------------------------
  //请求所有的实验室接口。
  getLabTypleList = ()=>{
    // step1. 请求列表数据
    fetch('lab/listAll', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        const {responseObject} = res;
        let labCode = responseObject.length > 0 ? responseObject[0]['code'] : '';

        const { timeUnit, activeKey} = this.state;
        const PickerValue = getTimeDistance(timeUnit); //默认查'全年的数据'。
        //设置状态。
        this.setState({
          labList: responseObject,
          labCode: labCode,
          rangePickerValue: PickerValue,
        });

        //step2. 查询列表。
        this.getLabStatisticsData({activeKey, rangePickerValue:PickerValue, labCode});
      },
      error: (err)=>{
        message.error(err.message||'响应失败！');
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
  //------------------start 统计数量接口-------------------------------------------
  //3.报告单数量统计接口。
  getReportCount = (selected ={}, callback=()=>{})=>{
    fetch('labCount/reportEveryDayCount',{
      // method: 'post',
      // headers: {},
      data: selected,
      success: (res)=>{
        //callback && callback(null, res)
        const {responseObject} = res;
        this.setState({
          salesData: responseObject,
        })
      },
      error: (err)=>{
        //callback && callback(err, null)
        message.error(err.message+' 请求失败');
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
  //2.申请单金额统计接口。
  getApplyBillMoney = (selected ={}, callback=()=>{})=>{
    fetch('labCount/applyBillEveryDayMoney',{
      // method: 'post',
      // headers: {},
      data: selected,
      success: (res)=>{
        //callback && callback(null, res)
        const {responseObject} = res;
        this.setState({
          salesData: responseObject,
        })
      },
      error: (err)=>{
        //callback && callback(err, null)
        message.error(err.message+' 请求失败');
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
  //1.申请单数量统计接口
  getApplyBillCount = (selected ={}, callback=()=>{})=>{
    fetch('labCount/applyBillEveryDayCount',{
      // method: 'post',
      // headers: {},
      data: selected,
      success: (res)=>{
        const {responseObject } = res;
        this.setState({
          salesData: responseObject,
        })
      },
      error: (err)=>{
        message.error(err.message+' 申请单请求失败');
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

  /**
   * @interface 总的查询函数方法
   * @param {Array} 选取的时间段PickerValue
   * @param {string} 点击选取的实验室编号labCode
   * */
  getLabStatisticsData = ({activeKey, rangePickerValue: PickerValue=[], labCode})=> {
    // case1.请求参数
    let fdata ={
      startTime: PickerValue[0].unix()*1000,//mount转时间戳。
      endTime: PickerValue[1].unix()*1000,
      labCode: labCode,
    }
    console.log('activeKey', activeKey, ' fdata',fdata);
    // case2.查询类型
    //Todo.统一调用接口函数
    switch (activeKey){
      case '1': console.log('申请单数量统计'); this.getApplyBillCount({...fdata}); break;
      case '2': console.log('申请单金额统计'); this.getApplyBillMoney({...fdata});
        break;
      case '3': console.log('报告单数量统计'); this.getReportCount({...fdata});
        break;
      default : console.log('未知情况');  break;
    }
  }
  //-----------------------统计 end --------------------------------------------------


  isActive(type) {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return;
    }
    if (rangePickerValue[0].isSame(value[0], 'day') && rangePickerValue[1].isSame(value[1], 'day')) {
      return styles.currentDate;
    }
  }

  //---------------------- 动作1-------------------------------------------------------
  /**
   * @interface 点击实验室下拉列表
   * @param {string} 点击的value
   * */
  handleSelect = (value)=>{
    this.setState({
      labCode: value,
    });
    //step2. 查询列表。
    const {activeKey, rangePickerValue} = this.state;
    this.getLabStatisticsData({activeKey, rangePickerValue, labCode: value});
  }

  //---------------------- 动作2 -------------------------------------------------------
  /**
   * @interface 查询条件类型
   * @param {string} type 1:今日、2:本周、3:本月、4:今年
   * */
  selectDate = (type) => {
    const PickerValue = getTimeDistance(type);
    this.setState({
      rangePickerValue: PickerValue,
    });
    //step2. 查询列表。
    const {activeKey, labCode} = this.state;
    this.getLabStatisticsData({activeKey, rangePickerValue: PickerValue , labCode});
  }

  //---------------------- 动作3-------------------------------------------------------
  /**
   * @interface 点击日期选择控件
   * @param {string} 点击的rangePickerValue
   * */
  handleRangePickerChange = (rangePickerValue) => {
    //site1. 当时间段存在。
    if(rangePickerValue.length > 0){
      this.setState({
        rangePickerValue,
      });
      //case1.请求查询
      const {labCode, activeKey} = this.state;
      this.getLabStatisticsData({activeKey, rangePickerValue, labCode});
    }
    //site2. 当时间段被清空不存在时,查询全年。
    else {
      const PickerValue = getTimeDistance('year');
      this.setState({
        rangePickerValue: PickerValue,
      });
      //case1.请求查询
      const {labCode, activeKey} = this.state;
      this.getLabStatisticsData({activeKey, rangePickerValue:PickerValue, labCode});
    }
  }

  //---------------------- 动作4-------------------------------------------------------
  /**
   * @interface 点击签页切换
   * @param {string} 点击的key
   * */
  handleTabClick = (value) => {
    this.setState({
      activeKey: value,
    });
    //step2. 查询列表。
    const {rangePickerValue, labCode} = this.state;
    this.getLabStatisticsData({activeKey: value, rangePickerValue, labCode});
  }


  //-------------------------------------- 条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = ()=>{ //点击查询按钮。
    const {rangePickerValue, labCode, activeKey} = this.state;
    this.getLabStatisticsData({activeKey, PickerValue: rangePickerValue, labCode});
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {rangePickerValue, labCode, activeKey} = this.state;
    this.getLabStatisticsData({activeKey, PickerValue: rangePickerValue, labCode});
  };
  //---------------------------------------------------------------------------------

  render() {
    const { form,  } = this.props;
    const { getFieldDecorator } = form;
    const { rangePickerValue, salesType, salesData, activeKey, currentTabKey, loading,
      labList, labCode, } = this.state;


    //折线图
    let data3 = [];
    if(salesData.length > 0 ){
      salesData.forEach((item)=> {
         let row ={};
         row['x'] = item['date'];
         row['y'] = item['count'];
        data3.push( row);
      });
    }
    console.log('data3', data3);

    const salesExtra = (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          <a className={this.isActive('today')} onClick={() => this.selectDate('today')}>
            今日
          </a>
          <a className={this.isActive('week')} onClick={() => this.selectDate('week')}>
            本周
          </a>
          <a className={this.isActive('month')} onClick={() => this.selectDate('month')}>
            本月
          </a>
          <a className={this.isActive('year')} onClick={() => this.selectDate('year')}>
            全年
          </a>
        </div>
        <RangePicker
          value={rangePickerValue}
          onChange={this.handleRangePickerChange}
          style={{ width: 256 }}
        />
      </div>
    );

    const formEle = (
      <Form layout="inline">
        <Row>
          <Col span={6}>
             <span style={{fontWeight:800,fontSize:17,}}>实验室&nbsp;:&nbsp;</span>
             <Select
               style={{width: 200, marginTop: -10,}}
               value={labCode !== ''? labCode : ''} //指定下拉列表框中默认选中项的key。
               placeholder="不限"
               allowClear={false}
               multiple={true}
               combobox={false}
               tags={false}
               showSearch={false}
               filterOption={false}
               optionFilterProp={`children`}
               labelInValue={false}
               tokenSeparators={null}
               //getPopupContainer={this.getPopup} 菜单滚动定位问题
               onSelect={this.handleSelect}
             >
               {labList.map((item)=> {
                 return (
                   <Select.Option value={item.code} key={item.id}>{item.name}</Select.Option>
                  )
                })
               }
             </Select> </Col>
          <Col span={10}>{salesExtra} </Col>
          <Col span={4}>{/*<ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
           <Button
           onClick={this.queryClick}
           type="primary"
           icon="search">查询</Button>
           <Button
           onClick={this.resetClick}
           icon="reload">重置</Button>
           </ButtonContainer>*/}</Col>
        </Row>
      </Form>
    )

    //门店折线图
    //console.log('[门店数据]:', offlineData);
    //console.log('[折线数据]:',  offlineChartData);
    const offlineData = [{cvr: 0.5, name:"门店1"}, {cvr: 0.6, name:"门店2"}, {cvr:0.4, name:"门店3"}, {cvr:0.41, name:"门店4"},];
    const offlineChartData= [
      {x: 1532170101361,y1: 41, y2: 69}, {x:1532162172361, y1: 89, y2:76},{x:1532156293361, y1:61, y2: 91},{x: 1532156904361,y1: 55, y2:86},
      {x: 1532156915361,y1: 60, y2: 81}, {x: 1532156926361,y1: 51, y2:82},{x: 1532156936861,y1: 65, y2:96}, {x: 1532156946891,y1: 55, y2:86},
      {x: 1532156957361,y1: 58, y2: 88}, {x: 1532156968361,y1: 60, y2:89},{x: 1532156979361,y1: 49, y2:80}, {x: 1532156986361,y1: 70, y2:99},
     ];

    const activeKey2 = currentTabKey || (offlineData[0] && offlineData[0].name); // ||时，遇到为true的分项就停止处理。

    const CustomTab = ({ data, currentTabKey: currentKey }) => (
      <Row gutter={8} style={{ width: 138, margin: '8px 0' }}>
        <Col span={12}>
          <NumberInfo
            title={data.name}
            subTitle="转化率"
            gap={2}
            total={`${data.cvr * 100}%`}
            theme={(currentKey !== data.name) && 'light'}
          />
        </Col>
        <Col span={12} style={{ paddingTop: 36 }}>
          <Pie
            animate={false}
            color={(currentKey !== data.name) && '#BDE4FF'}
            inner={0.55}
            tooltip={false}
            margin={[0, 0, 0, 0]}
            percent={data.cvr * 100}
            height={64}
          />
        </Col>
      </Row>
    );

    return (
      <div>
        <Card
          loading={loading}
          bordered={false}
          bodyStyle={{ padding: 0 }}
        >
          {/* 1.查询条件*/}
          <div style={{paddingTop:2, paddingBottom:2, paddingLeft:20,background:'#fafafa'}}>
            {formEle}
          </div>

          {/* 2.统计图表*/}
          <div className={styles.salesCard}>
            <Tabs size="large" tabBarStyle={{marginBottom: 24}} defaultActiveKey={activeKey} onTabClick={this.handleTabClick} //tabBarExtraContent={salesExtra}
            >
              <TabPane tab="申请单" key="1">
                <Col xl={24} lg={14} md={24} sm={24} xs={24}>
                  <SingleLineChart
                    title="数量"
                    height={400}
                    data={data3} />
                 </Col>
              </TabPane>

            <TabPane tab="申请单金额" key="2">
                <Col xl={24} lg={14} md={24} sm={24} xs={24}>
                  <SingleLineChart
                    title="金额"
                    height={400}
                    data={data3} />
                </Col>
              </TabPane>

              <TabPane tab="报告单" key="3">
                <Col xl={24} lg={14} md={24} sm={24} xs={24}>
                  <SingleLineChart
                    title="数量"
                    height={400}
                    data={data3} />
                </Col>
              </TabPane>
            </Tabs>
          </div>
        </Card>

        <Card
          title="门店转化率"
          loading={loading}
          className={styles.offlineCard}
          bordered={false}
          bodyStyle={{ padding: '0 0 32px 0' }}
          style={{ marginTop: 32 }}
        >
          <Tabs activeKey={activeKey2} onChange={this.handleTabChange}>
            {offlineData.map(shop => (
                <TabPane
                  tab={<CustomTab data={shop} currentTabKey={activeKey2} />}
                  key={shop.name}
                >
                  <div style={{padding:'0 24px'}}>
                    <TimelineChart
                      data={offlineChartData}
                      titleMap={{ y1:'客流量', y2:'支付笔数'}}
                    />
                  </div>
                </TabPane>)
              )
            }
          </Tabs>
        </Card>
      </div>
    );
  }
}
