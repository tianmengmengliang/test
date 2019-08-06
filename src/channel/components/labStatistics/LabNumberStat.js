/**
 * Created by jpt on 2018/7/17 0017.
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Card, Form,Input, message, Popconfirm, Divider, Select, Button, notification, Modal,
  Tabs, Table, Radio, DatePicker, Tooltip, Menu, Dropdown } from 'antd';
import numeral from 'numeral';
import moment from 'moment'
import { ChartCard, yuan, MiniArea, MiniBar, MiniProgress, Field, Bar, Pie, TimelineChart,} from '../../../components/Charts';
import { ButtonContainer, SingleLineChart } from '../../../compoents2/';
import Trend  from '../../../components/Trend';
import NumberInfo from '../../../components/NumberInfo';
import { getTimeDistance } from '../../../utils/utils';
import styles from './Analysis.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {fetch, } from '../../../services/';

const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const rankingListData = [];
for (let i = 0; i < 7; i += 1) {
  rankingListData.push({
    title: `即检 ${i} 号实验室`,
    total: 5234,
  });
}

@connect(state => ({
  chart: state.chart,
}))

@Form.create()

/**
 *  统计实验室数量
 *
 * */
export default class LabNumberStat extends Component {
  state = {
    loading: true,
    salesType: 'all',
    rangePickerValue: [],
    salesData: [],                            //统计数据。
    activeKey: '1',                             //激活的tabPane的key，
    timeUnit: 'year',                                 //日期类型为全年
  }

  componentDidMount() {
    this.setState({ loading: false });
    const {timeUnit} = this.state;
    this.selectDate(timeUnit);  //默认查'全年的数据'。
  }

  componentWillUnmount() {
    //const { dispatch } = this.props;
    //dispatch({
    //  type: 'chart/clear',
    //});
  }

  handleChangeSalesType = (e) => {
    this.setState({
      salesType: e.target.value,
    });
  }

  //handleTabChange = (key) => {
  //  this.setState({
  //    currentTabKey: key,
  //  });
  //}

  //------------------start 统计数量接口-------------------------------------------
  //3.报告单数量统计接口。
  getReportCount = (selected ={}, callback=()=>{})=>{
    fetch('labCount/reportCount',{
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
    fetch('labCount/applyBillMoney',{
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
    fetch('labCount/applyBillCount',{
      // method: 'post',
      // headers: {},
      data: selected,
      success: (res)=>{
        const {responseObject} = res;
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
  getLabStatisticsData = ({activeKey, rangePickerValue: PickerValue=[], timeUnit: type})=> {
    let timeUnit = 0;
    switch (type){
      case 'today': timeUnit= 1; break;
      case 'week' : timeUnit= 2; break;
      case 'month': timeUnit= 3; break;
      case 'year' : timeUnit= 4; break;
      default : timeUnit= 5; break;
    }

    // case1.请求参数
    let fdata ={
      startTime: PickerValue[0].unix()*1000,//mount转时间戳。
      endTime: PickerValue[1].unix()*1000,
      type: timeUnit,
    }
    console.log('请求数据fdata', fdata);

    // case2.查询类型
    //Todo.统一调用接口函数
    switch (activeKey){
      case '1': console.log('申请单数量统计'); this.getApplyBillCount({...fdata}); break;
      case '2': console.log('申请单金额统计'); this.getApplyBillMoney({...fdata}); break;
      case '3': console.log('报告单数量统计'); this.getReportCount({...fdata});break;
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

  //---------------------- 动作2 -------------------------------------------------------
  /**
   * @interface 查询条件类型
   * @param {string} type 1:今日、2:本周、3:本月、4:今年
   * */
  selectDate = (type) => {
    const PickerValue = getTimeDistance(type);
    this.setState({
      rangePickerValue: PickerValue,
      timeUnit: type,
    });

    //step2. 查询列表。
    const {activeKey} = this.state;
    this.getLabStatisticsData({activeKey, rangePickerValue: PickerValue , timeUnit: type});
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
      const {timeUnit, activeKey} = this.state;
      this.getLabStatisticsData({activeKey, rangePickerValue, timeUnit});
    }
    //site2. 当时间段被清空不存在时,查询全年。
    else {
      const _type = 'year';
      const PickerValue = getTimeDistance(_type);
      this.setState({
        rangePickerValue: PickerValue,
        timeUnit: _type,
      });
      //case1.请求查询
      const {labCode, activeKey} = this.state;
      this.getLabStatisticsData({activeKey, rangePickerValue:PickerValue, timeUnit: _type});
    }
  }

  //-------------------------------------- 动作4 ---------------------------------------
  /**
   * @interface 点击签页切换
   * @param {string} 点击的key
   * */
  onTabClick = (value)=>{
    this.setState({
      activeKey: value,
    })
    //step2. 查询列表。
    const {rangePickerValue, timeUnit} = this.state;
    this.getLabStatisticsData({activeKey: value, rangePickerValue, timeUnit});
  };


  render() {
    const { form,  } = this.props;
    const { getFieldDecorator } = form;
    const { rangePickerValue, salesType, salesData, activeKey, loading } = this.state;

    //1.[柱状图统计数据]
    let _salesData= [];
    if(salesData.length > 0 ){
      salesData.forEach((item)=> {
         let row ={};
        row['id'] = item['labId'];
        row['x'] = item['labName'];
        row['y'] = Number( item['count']);
        row['date'] = item['date'];
        _salesData.push( row);
      });
    }
    else {
        _salesData.push({x:'', y: 0});
    }
    //console.log('[重组后的数据]:', _salesData);

    //2.[饼状图统计数据]
    const salesPieData = _salesData;

    //3.[表格数据]
    const searchData = [
      {count: 1022, id:1, keyword:"九洲门诊部", range:6, status:0},
      {count: 922,  id:2,  keyword:"青田门诊部", range:6, status:1},
      {count: 622,  id:3,  keyword:"健保好医生", range:6, status:1},
    ];

    const menu = (
      <Menu>
        <Menu.Item>操作一</Menu.Item>
        <Menu.Item>操作二</Menu.Item>
      </Menu>
    );

    const iconGroup = (
      <span className={styles.iconGroup}>
        <Dropdown overlay={menu} placement="bottomRight">
          <Icon type="ellipsis" />
        </Dropdown>
      </span>
    );

    const salesExtra = (
      <div style={{float:'left',marginTop: 3}}>
        <div className={styles.salesExtra}>
          <a className={this.isActive('today')} onClick={() => this.selectDate('today')}>
            今日
          </a>
          <a className={this.isActive('week')}  onClick={() => this.selectDate('week')}>
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
          style={{width: 256}}
        />
      </div>
    );

    const formEle =(
      <Form layout="inline">
        <Row>
          {/*<Col span={6}><Form.Item
            label="查询类型"
            >
              {getFieldDecorator(`type`, {
                rules: false
              })(
                <Select
                  style={{width: 120, marginTop: -10,}}
                  placeholder="不限"
                  allowClear={true}
                  multiple={true}
                  combobox={false}
                  tags={false}
                  showSearch={false}
                  filterOption={false}
                  optionFilterProp={`children`}
                  labelInValue={false}
                  tokenSeparators={null}
                  //getPopupContainer={this.getPopup} //菜单滚动定位问题
                >
                  <Select.Option value={'year'}>赵氏集团实验室</Select.Option>
                  <Select.Option value={'moth'}>夏老板实验室</Select.Option>
                </Select>
              )}
            </Form.Item> </Col>*/}
          <Col span={16}>{salesExtra} </Col>
          <Col span={6}>{/* <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
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

    const columns = [
      {
        title: '排名',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: '门诊部',
        dataIndex: 'keyword',
        key: 'keyword',
        render: text => <span>{text}</span>,
      },
      {
        title: '用户数',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
        className: styles.alignRight,
      },
      {
        title: '周涨幅',
        dataIndex: 'range',
        key: 'range',
        sorter: (a, b) => a.range - b.range,
        render: (text, record) => (
          <Trend flag={record.status === 1 ? 'down' : 'up'}>
            <span style={{ marginRight: 4 }}>{text}%</span>
          </Trend>
        ),
        className: styles.alignRight,
      },
    ];

    return (
      <div>
        <Card
          loading={loading}
          bordered={false}
          bodyStyle={{padding: 0 }}
        >
          {/* 1.查询条件*/}
          <div style={{paddingTop:2, paddingBottom:2, paddingLeft:20,background:'#fafafa'}}>
            {formEle}
          </div>
          {/* 2.统计图表*/}
          <div className={styles.salesCard}>
            <Tabs size="large" tabBarStyle={{marginBottom:24}} defaultActiveKey={activeKey} onTabClick={this.onTabClick}>
              <TabPane tab="申请单数量" key='1'>
                  <Row>
                    <Col xl={10} lg={24} md={24} sm={24} xs={24}>
                      <div className={styles.salesBar}>
                        <Bar
                          height={355}
                          title="申请单数量"
                          data={_salesData}
                        />
                      </div>
                    </Col>
                    <Col xl={14} lg={24} md={24} sm={24} xs={24}>
                        <h4 style={{marginTop: 8, marginBottom: 32 }}>申请单占比</h4>
                        <Pie
                          hasLegend
                          subTitle="占比"
                          total={salesPieData.reduce((pre, now) => now.y + pre, 0)}
                          data={salesPieData}
                          valueFormat={val => val}
                          height={250}
                          lineWidth={4}
                        />
                    </Col>
                  </Row>
              </TabPane>

              <TabPane tab="申请单金额"  key='2'>
                  <Row>
                    <Col xl={10} lg={24} md={24} sm={24} xs={24}>
                      <div className={styles.salesBar}>
                        <Bar
                          height={355}
                          title="申请单金额"
                          data={_salesData}
                        />
                      </div>
                    </Col>
                    <Col xl={14} lg={24} md={24} sm={24} xs={24}>
                      <h4 style={{ marginTop: 8, marginBottom: 32 }}>金额占比</h4>
                      <Pie
                        hasLegend
                        subTitle="申请单占比"
                        total={yuan(salesPieData.reduce((pre, now) => now.y + pre, 0))}
                        data={salesPieData}
                        valueFormat={val => yuan(val)}
                        height={248}
                        lineWidth={4}
                      />
                    </Col>
                  </Row>
              </TabPane>

              <TabPane tab="报告单数量" key='3'>
                  <Row>
                    <Col xl={10} lg={24} md={24} sm={24} xs={24}>
                      <div className={styles.salesBar}>
                        <Bar
                          height={355}
                          title="报告单数量"
                          data={_salesData}
                        />
                      </div>
                    </Col>
                    <Col xl={14} lg={24} md={24} sm={24} xs={24}>
                      <h4 style={{ marginTop: 8, marginBottom: 32 }}>报告单占比</h4>
                      <Pie
                        hasLegend
                        subTitle="占比"
                        total={salesPieData.reduce((pre, now) => now.y + pre, 0)}
                        data={salesPieData}
                        valueFormat={val => val}
                        height={248}
                        lineWidth={4}
                      />
                    </Col>
                  </Row>
              </TabPane>
            </Tabs>
          </div>
        </Card>

        <Card
          loading={loading}
          bordered={false}
          title="汇总表"
          extra={iconGroup}
          style={{ marginTop: 24 }}
        >
          <Table
            rowKey={record => record.index}
            size="small"
            columns={columns}
            dataSource={searchData}
            pagination={{
                  style: { marginBottom: 0 },
                  pageSize: 5,
            }}
          />
        </Card>
      </div>
    );
  }
}
