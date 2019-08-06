import React, { PureComponent } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import moment from 'moment'
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import { TimeDisplay, MapChart, DeviceGridList,MapGaode, LineChart, SingleLineChart, OpenRateLineChart,
  ExceptionRateLineChart, PieChart, ButtonContainer, } from '../../compoents2/';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import NumberInfo from '../../components/NumberInfo';
import StandardFormRow from '../../components/StandardFormRow';
import TagSelect from '../../components/TagSelect';
import styles from './Monitor2.less';
import SearchButton from "../../compoents2/button/SearchButton";
import fetch from '../../services/request.js'

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
  //monitor: state.monitor,
  rule: state.rule,
}))
@Form.create()

/*
 *  监控页。
 * */
export default class TableList extends PureComponent {

  _retInitialState = ()=>{
      return {
        addInputValue: '',
        modalVisible: false,
        expandForm: false,
        selectedRows: [],
        formValues: {},
        chart:{
            data2: [],
        },
      }
  };

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
    });

    this.getDevicesStatisticsList({
        startTime: 1521571958255 , endTime: 1521871958255,
        timeUnit: 'day',  //时间单位
        deviceSN:  ""  ,  //设备编号
        modulleNo: "",    //(POCT BOX模块名称)
        projectNo: "",    //项目名称
        type: "",          //模块类型、error、open/close、
        subType: "",      //(预留字段)
        deviceTypeId: "",   //设备类型（js1000、NFL、 POCT BOX、js3000）
    });
  }

  // step1 获取所有查询参数
  _getAllListQuery = (num)=>{
    let _q={}
    this.props.form.validateFieldsAndScroll([`timeUnit${num}`, `Time${num}`,`deviceTypeId${num}`], (err, values) => {
      if(err){
        return;
      }
       //console.log('_values', values);
      let t1,t2;
      if(values[`Time${num}`] === undefined){
          t1= undefined;
          t2= undefined;
      }else{
          t1= values[`Time${num}`][0].unix()*1000;
          t2= values[`Time${num}`][1].unix()*1000;
      }

      _q ={
          startTime: t1,
            endTime: t2,
            timeUnit: values[`timeUnit${num}`],
            deviceSN:  ""  ,  //设备编号
            modulleNo: "",    //(POCT BOX模块名称)
            projectNo: "",    //项目名称
            type: "",          //模块类型、error、open/close、
            subType: "",      //(预留字段)
            //deviceTypeId: "",     //设备类型（js1000、NFL、 POCT BOX、js3000）
      }
    });

    return {
      ..._q
    }
  };

  /**
   * @interface  根据参数获取统计数据
   */
  getDevicesStatisticsList = (query, callback = ()=>{})=>{
    const _q = query;
    //console.log("请求参数", _q);
  }





  /**
   * 3.请求设备异常率每台每天统计图
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'rule/fetch',
      payload: params,
    });
  }

  //
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'rule/fetch',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'rule/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  /**
   * 4.行记录选中时。
   */
  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'rule/fetch',
        payload: values,
      });
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleAddInput = (e) => {
    this.setState({
      addInputValue: e.target.value,
    });
  }

  handleAdd = () => {
    this.props.dispatch({
      type: 'rule/add',
      payload: {
        description: this.state.addInputValue,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="调用次数">
              {getFieldDecorator('number')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="更新日期">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status3')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status4')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  //---------------- 1.条件查询 ----------------------------------------
  // step1 点击查询按钮查询
  queryClick = (num, checked)=>{
    //console.log("查询按钮事件源", num);
    let q= {}
    switch(num) {
      case 1:
        q= this._getAllListQuery(num);
        this.getDevicesStatisticsList(q, (err, res)=> {//一、根据id， 查看申请单详细。
          if(err){
              return;
          }
          const {responseObject: listPage} = res;
          console.log("响应统计数据", listPage);
          this.setState({
            chart:{
              data2: listPage,
            }
          });
        });
        break;
      case 2:
        q= this._getAllListQuery(num);
        this.getDevicesStatisticsList(q);
        break;
      case 3:
        q= this._getAllListQuery(num);
        this.getDevicesStatisticsList(q);
        break;
      default: console.log("请指明事件源的标识");
    }
  };
  resetClick = (num, checked)=>{ //重置查询条件。
    switch(num) {
      case 1: this.props.form.resetFields(); break;
      case 2: this.props.form.resetFields(); break;
      case 3: this.props.form.resetFields(); break;
      default: console.log("请指明事件源标识");
    }
    //this.props.form.resetFields();
    //this.getDevicesStatisticsList({})
  };

  /** 1.设置下拉列表固定 **/
  getPopup =( triggerNode )=>{
    return  triggerNode
  }
  /** 2.设置已过日期不可选 **/
  disabledDate =( current )=>{
    return current && current.valueOf() < Date.now();
  }
  // 2.函数渲染组件
  formEle1 =({index: num})=>{
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{marginTop: -20, marginBottom:10,background:'#fafafa',}}>
        <Form layout="inline">
          <Form.Item label="统计单位">
            {getFieldDecorator(`timeUnit${num}`, {
              initialValue: 'day',
              rules: false
            })(
              <Select
                style={{width: 100,marginTop: -10,}}
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
                getPopupContainer={this.getPopup} //菜单滚动定位问题
              >
                <Select.Option value={'year'}>年</Select.Option>
                <Select.Option value={'moth'}>月</Select.Option>
                <Select.Option value={'day'} >日</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="时间">
            {getFieldDecorator(`Time${num}`, {
              initialValue: [],
              rules: false
            })(
              <DatePicker.RangePicker
                allowClear
                showTime={false}
                format={''}
                ranges={{ '1个月': [moment(), moment().add(1, 'M')], '2个月': [moment(), moment().add(2, 'M')], '3个月': [moment(), moment().add(3, 'M')] }}
                format="YYYY-MM-DD"
                //disabledDate={this.disabledDate }  已过日期不可选。
              />
            )}
          </Form.Item>
          <Form.Item label="设备类型">
            {getFieldDecorator(`state${num}`, {
              initialValue: [],
              rules: false
            })(
              <Select
                style={{width: 200,marginTop: -10,}}
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
                getPopupContainer={this.getPopup} //菜单滚动定位问题
              >
                <Select.Option value={1} key={1}>js1000</Select.Option>
                <Select.Option value={2} key={2}>NFL</Select.Option>
                <Select.Option value={3} key={3}>POCT BOX</Select.Option>
                <Select.Option value={4} key={4}>js3000</Select.Option>
              </Select>
            )}
          </Form.Item>
          <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
            <Button
              onClick={(e)=> this.queryClick(num, e.target.checked)}
              type="primary"
              icon="search">查询</Button>
            <Button
              onClick={(e)=> this.resetClick(num, e.target.checked)}
              icon="reload">重置</Button>
          </ButtonContainer>
        </Form>
      </div>
    )
  }


  render() {
    const { form,  } = this.props; //monitor
    //const { tags } = monitor;

    const { getFieldDecorator } = form;

    /**
     * @constant { boolean } spinning - 当前页面加载状态
     * @constant { string } tip - 当前页面加载状态文本
     * @constant { object } listPage - 当前页面列表分页数据结构
     * @constant { Array.<number> } selectedIds - 选择的行数据ids集合
     * @constant { Array.<object> } selectedRows - 选择的行数据集合
     * */
    const { spinning, tip, listPage = {},
      initialDataStatus = '', listPageStatus = '', selectedRows,
      modalVisible, addInputValue,  chart: { data2}, num } = this.state;


    const { rows = [] } = listPage;
    //const { rule: { loading: ruleLoading, data:{list: dataSource, pagination} } } = this.props;
    //console.log("开关机填充chart：", data2);

    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 12 },
      },
    };

    const owners = [
      {
        id: 'wzj',
        name: '我自己',
      },
      {
        id: 'wjh',
        name: '客服1',
      },
      {
        id: 'zxx',
        name: '客服2',
      },
      {
        id: 'zly',
        name: '客服3',
      },
      {
        id: 'ym',
        name: '客服4',
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量设置</Menu.Item>
      </Menu>
    );

   /* const data2 = [
      { day: '01', Open: 6.0,  Close: 19 },
      { day: '02', Open: 6.0,  Close: 18 },
      { day: '03', Open: 6.0,  Close: 17 },
      { day: '04', Open: 6.0,  Close: 16 },
      { day: '05', Open: 10,  Close: 15 },
      { day: '06', Open: 14.0,  Close: 11 },
      { day: '07', Open: 10.0,  Close: 9 },
      { day: '08', Open: 6.9,  Close: 4.2 },
      { day: '09', Open: 9.5,  Close: 5.7 },
      { day: '10', Open: 14.5, Close: 8.5 },
      { day: '11', Open: 18.4, Close: 11.9 },
      { day: '12', Open: 21.5, Close: 15.2 },
      { day: '13', Open: 25.2, Close: 17.0 },
      { day: '14', Open: 26.5, Close: 16.6 },
      { day: '15', Open: 23.3, Close: 14.2 },
      { day: '16', Open: 18.3, Close: 10.3 },
      { day: '17', Open: 13.9, Close: 6.6 },
      { day: '18', Open: 9.6,  Close: 4.8 },
      { day: '19', Open: 9.6,  Close: 4.8 },
      { day: '20', Open: 9.6,  Close: 4.8 }
    ];*/

    const data3 = [
      { day: '01', value: 3 },
      { day: '02', value: 4 },
      { day: '03', value: 5 },
      { day: '04', value: 4.9 },
      { day: '05', value: 6 },
      { day: '06', value: 7 },
      { day: '07', value: 9 },
      { day: '08', value: 10 },
      { day: '09', value: 3.5 },
      { day: '10', value: 1.5 }
    ];
    const data3_2 = [
      { day: '01', value: 3 },
      { day: '02', value: 4 },
      { day: '03', value: 5 },
      { day: '04', value: 4.9 },
      { day: '05', value: 6 },
      { day: '06', value: 5 },
      { day: '07', value: 4 },
      { day: '08', value: 2 },
      { day: '09', value: 3 },
      { day: '10', value: 1 }
    ];

    const data4 = [
      { item: 'CRP', count: 40 },
      { item: 'HDP', count: 21 },
      { item: 'TG', count: 17 },
      { item: 'TL', count: 13 },
      { item: 'HL', count: 9 }
    ];

    const data5 = [
      { item: '事例一', count: 40 },
      { item: '事例二', count: 21 },
      { item: '事例三', count: 17 },
      { item: '事例四', count: 13 },
      { item: '事例五', count: 9 }
    ];

    const arryTyple = ['error','open', 'close']; //图标类型。


    const formEle2 =(
        <div style={{marginTop: -20, marginBottom:10,background:'#fafafa',}}>
          <Form layout="inline">
            <Form.Item label="统计单位">
              {getFieldDecorator('state', {
                initialValue: [],
                rules: false
              })(
                <Select
                  style={{width: 100,marginTop: -10,}}
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
                  getPopupContainer={this.getPopup} //菜单滚动定位问题
                >
                  <Select.Option value={6}>年</Select.Option>
                  <Select.Option value={7}>月</Select.Option>
                  <Select.Option value={9}>日</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="时间">
              {getFieldDecorator('markingTime', {
                rules: false
              })(
                <DatePicker.RangePicker
                  allowClear
                  showTime={false}
                  format={''}
                  ranges={{ '1个月': [moment(), moment().add(1, 'M')], '2个月': [moment(), moment().add(2, 'M')], '3个月': [moment(), moment().add(3, 'M')] }}
                  format="YYYY-MM-DD"
                  //disabledDate={this.disabledDate }  已过日期不可选。
                />
              )}
            </Form.Item>
            <Form.Item label="设备类型">
              {getFieldDecorator('serialNumber', {
                rules: false
              })(
                <Input  placeholder="不限" />
              )}
            </Form.Item>
            <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}
            >
              <Button
                onClick={this.queryClick}
                type="primary"
                icon="search">查询</Button>
              <Button
                onClick={this.resetClick}
                icon="reload">重置</Button>
            </ButtonContainer>
          </Form>
        </div>
    );

    const formEle3 = (
      <div style={{marginTop: -20, marginBottom:10,background:'#fafafa',}}>
        <Form layout="inline">
          <Form.Item label="统计单位">
            {getFieldDecorator('state', {
              initialValue: [],
              rules: false
            })(
              <Select
                style={{width: 100,marginTop: -10,}}
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
                getPopupContainer={this.getPopup} //菜单滚动定位问题
              >
                <Select.Option value={6}>年</Select.Option>
                <Select.Option value={7}>月</Select.Option>
                <Select.Option value={9}>日</Select.Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label="时间">
            {getFieldDecorator('markingTime', {
              rules: false
            })(
              <DatePicker.RangePicker
                allowClear
                showTime={false}
                format={''}
                ranges={{ '1个月': [moment(), moment().add(1, 'M')], '2个月': [moment(), moment().add(2, 'M')], '3个月': [moment(), moment().add(3, 'M')] }}
                format="YYYY-MM-DD"
                //disabledDate={this.disabledDate }  已过日期不可选。
              />
            )}
          </Form.Item>
          <Form.Item label="设备类型">
            {getFieldDecorator('serialNumber', {
              rules: false
            })(
              <Input  placeholder="不限" />
            )}
          </Form.Item>
          <ButtonContainer style={{margin:0, marginTop:4, display:'inline-block',}}>
            <Button
              onClick={this.queryClick}
              type="primary"
              icon="search">查询</Button>
            <Button
              onClick={this.resetClick}
              icon="reload">重置</Button>
          </ButtonContainer>
        </Form>
      </div>
    );

    return (
      <PageHeaderLayout
      title={
        <Row gutter={24}>
          {/* <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card title="活动情况预测" style={{ marginBottom: 24 }} bordered={false}>
              <ActiveChart />
            </Card>
            <Card
              title="券核效率"
              style={{ marginBottom: 24 }}
              bodyStyle={{ textAlign: 'center' }}
              bordered={false}
            >
              <Gauge
                format={(val) => {
                  switch (parseInt(val, 10)) {
                    case 20:
                      return '差';
                    case 40:
                      return '中';
                    case 60:
                      return '良';
                    case 80:
                      return '优';
                    default:
                      return '';
                  }
                }}
                title="跳出率"
                height={180}
                percent={87}
              />
            </Card>
          </Col>*/}
        </Row>
      }>
        {/*<Row>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            ---- 3.高德地图 ---
            <Card title="LBS设备移动定位" style={{ marginBottom: 24 }} bordered={false}>
              <Col span={20} offset={2}>
                <MapGaode height={500} />
              </Col>
            </Card>
          </Col>
        </Row>*/}

        <Card title="设备开机情况" style={{ marginBottom: 24 }} bordered={false}>
          {this.formEle1({index: 1})}
          <Col xl={14} lg={14} md={24} sm={24} xs={24}>
            <OpenRateLineChart
              title="开机率折线图"
              height={400}
              data={data2}/>
          </Col>
          <Col xl={10} lg={10} md={24} sm={24} xs={24}>
            {/*<PieChart
              title="开机率"
              height={400}
              data={data4} />*/}
          </Col>
        </Card>

        <Card title="设备试剂消耗用量情况" style={{ marginBottom: 24 }} bordered={false}>
          {this.formEle1({index: 2})}
          <Col xl={14} lg={14} md={24} sm={24} xs={24}>
            <SingleLineChart
              title="设备试剂消耗用量折线图"
              height={400}
              data={data3} />
          </Col>
          <Col xl={10} lg={10} md={24} sm={24} xs={24}>
            {/*<PieChart
              title="试剂用量比重"
              height={400}
              data={data4} />
              */}
          </Col>
        </Card>

        <Card title="设备异常情况" style={{ marginBottom: 24 }} bordered={false}>
          {this.formEle1({index: 3})}
          <Col xl={14} lg={14} md={24} sm={24} xs={24}>
            <ExceptionRateLineChart
              title="每台每天异常次数折线图"
              height={400}
              data={data3_2} />
          </Col>
          <Col xl={10} lg={10} md={24} sm={24} xs={24}>

          </Col>
        </Card>

        <Card bordered={false}>
          <Card bordered={false}>
            <Form layout="inline">
              <StandardFormRow title="设备类型" block style={{ paddingBottom: 11 }}>
                <FormItem>
                  {getFieldDecorator('category')(
                    <TagSelect onChange={this.handleFormSubmit} expandable>
                      <TagSelect.Option value="cat1">JS1000</TagSelect.Option>
                      <TagSelect.Option value="cat2">JS3000</TagSelect.Option>
                    </TagSelect>
                  )}
                </FormItem>
              </StandardFormRow>

              <StandardFormRow title="设备管理人员" grid >
                <Row>
                  <Col lg={16} md={24} sm={24} xs={24}>
                    <FormItem>
                      {getFieldDecorator('owner', {
                        initialValue: ['wjh', 'zxx'],
                      })(
                        <Select
                          mode="multiple"
                          style={{ maxWidth: 286, width: '100%' }}
                          placeholder="负责设备"
                        >
                          {owners.map(owner =>
                              <Option key={owner.id} value={owner.id}>{owner.name}</Option>
                            )
                          }
                        </Select>
                      )}
                      <a className={styles.selfTrigger} onClick={this.setOwner}>只看自己的</a>
                    </FormItem>
                  </Col>
                </Row>
              </StandardFormRow>

              <StandardFormRow title="其它选项" grid  last>
                <Row gutter={16}>
                  <Col xl={8} lg={10} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                      label="设备状态"
                    >
                      {getFieldDecorator('user', {})(
                        <Select
                          onChange={this.handleFormSubmit}
                          placeholder="不限"
                          style={{ maxWidth: 200, width: '100%' }}
                        >
                          <Option value="online">在线</Option>
                          <Option value="offline">离线</Option>
                          <Option value="exception">异常</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col xl={8} lg={10} md={12} sm={24} xs={24}>
                    <FormItem
                      {...formItemLayout}
                      label="所在地区"
                    >
                      {getFieldDecorator('rate', {})(
                        <FormItem
                          label="好评度"
                        >
                          {getFieldDecorator('rate', {})(
                            <Select
                              onChange={this.handleFormSubmit}
                              placeholder="不限"
                              style={{ maxWidth: 200, width: '100%' }}
                            >
                              <Option value="good">优秀</Option>
                            </Select>
                          )}
                        </FormItem>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </StandardFormRow>
            </Form>
          </Card>
          {/*------------------ table ------------------
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button onClick={() => this.handleModalVisible(true)} icon="plus" type="primary">新建</Button>
              <SearchButton>查看</SearchButton>
              {selectedRows.length > 0 && (
                  <span>
                    <Button>批量操作</Button>
                    <Dropdown overlay={menu}>
                      <Button> 更多操作 <Icon type="down" /></Button>
                    </Dropdown>
                  </span>
                )
              }
            </div>

            <StandardTable
              selectedRows={selectedRows}
              loading={ruleLoading}
              pagiantion={ pagination }
              dataSource={ dataSource }
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>*/}
        </Card>

        <Modal
          title="新建规则"
          visible={modalVisible}
          onOk={this.handleAdd}
          onCancel={() => this.handleModalVisible()}
        >
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label="描述"
          >
            <Input placeholder="请输入" onChange={this.handleAddInput} value={addInputValue} />
          </FormItem>
        </Modal>
      </PageHeaderLayout>
    );
  }
}

