import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, List, Card, Row, Col, Radio, Input, Progress,
  Button, Icon, Dropdown, Menu, Avatar, Tooltip,
  Select } from 'antd';
import numeral from 'numeral';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Pie, WaterWave, Gauge, TagCloud } from '../../components/Charts';
import { TimeDisplay, MapChart,} from '../../compoents2/';
import { LineChart } from '../../compoents2/LineChart';

import NumberInfo from '../../components/NumberInfo';
import CountDown from '../../components/CountDown';
import ActiveChart from '../../components/ActiveChart';
import StandardFormRow from '../../components/StandardFormRow';
import TagSelect from '../../components/TagSelect';

const { Option } = Select;
const FormItem = Form.Item;

const pageSize = 5;

import styles from './Monitor.less';

const targetTime = new Date().getTime() + 3900000;

@Form.create()
@connect(state => ({
  monitor: state.monitor,
}))
export default class Monitor extends PureComponent {

  /**
   * 根据组件props返回初始化state对象
   * @member _retInitialState
   * @params { object } props - 组件的属性对象
   * @returns { object } 返回初始化state对象
   * @access private
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
      }
    }
  };

  /**
   * Monitor的构造方法
   * @constructs MapChart
   * @params { object } props - 组件属性集合
   * */
  constructor(props) {
    super(props);
    this.state = this._retInitialState(props)
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'monitor/fetchTags',
    });
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
   * @member { function } getListPage
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
   * @member {function} getListPageClick
   * @param { object | undefined } query - 额外传入的查询参数
   * @param { function | undefined } callback - 回调函数
   * @param { string } listPageStateName - listPage在state name
   * @param { string } listPageStatusStateName - listPageStatus在state name
   * */
  getListPageClick = (query = {}, callback = null, listPageStateName = "listPage", listPageStatusStateName = "listPageStatus")=>{
    /**
     * @constant { number | undefined } pageIndex - 当前列表页索引
     * @constant { number | undefined } pageSize - 当前列表页的每页大小
     * */
    const { pageIndex, pageSize, ..._props } = query;

    /**
     * @constant { object } selectedDeviceType - 当前选择的设备类型定义的数据结构
     * */
    const { listPage = {} } = this.state;
    const { pageIndex: listPagePageIndex, pageSize: listPagePageSize,} = listPage;

    /**
     * @constant { object } _q - 表单获取查询字段和自定义字段
     * @constant { object } params - 查询参数对象
     * */
    const _q = this._getAllListQuery(query);
    const params = {
      ..._q,
      pageIndex: pageIndex || listPagePageIndex,
      pageSize: pageSize || listPagePageSize,
      ..._props,
    };
    this.getListPage(params, (err, res) => {
      if(err) {
        message.error(err.message || '数据失败');
        return;
      }

      /**
       * @constant { object } listPage - 列表分页数据结构
       * */
      const { responseObject: listPage = {} } = res;
      this.setState({
        [listPageStateName]: {
          ...listPage,
        },
      });

      callback && callback(err, res, { listPageStateName, listPageStatusStateName})
    });
  };

  /**
   * 初始化操作方法
   * @member getInitialDataClick
   * @param { object | undefined } query - 初始化查询参数对象
   * @param { function | undefined } callback - 回调函数-初始化操作
   * @param { object } data - 额外数据
   * */
  getInitialData = (query, callback, data = {}) => {
    this.getListPageClick(query, (err, res)=> {
      callback && callback(err, res, data);
      if(err) {
        this.setState({
          initialDataStatus: 'error'
        });
        return false;
      }else{
        this.setState({
          initialDataStatus: 'success'
        });
        return true;
      }
    }, data.listPageStateName, data.listPageStatusStateName)
  };

  /**
   * 初始化操作方法
   * @member getInitialDataClick
   * @param { object | undefined } query - 初始化查询参数对象
   * @param { function | undefined } callback - 回调函数-初始化操作
   * @param { object } data - 额外数据
   * */
  getInitialDataClick = (query, callback, data) => {
    this.setState({
      initialDataStatus: 'loading',
    });
    this.getInitialData(query, (err, res) => {
      callback && callback(err, res);
      if(err) {
        this.setState({
          initialDataStatus: 'loading',
        });
        return;
      }else{
        this.setState({
          initialDataStatus: 'success',
        });
      }
    }, data)
  };

  setOwner = () => {
    const { form } = this.props;
    form.setFieldsValue({
      owner: ['wzj'],
    });
  }

  fetchMore = () => {
    this.props.dispatch({
      type: 'list/fetch',
      payload: {
        count: pageSize,
      },
    });
  }

  handleTabChange = (key) => {
    const { dispatch } = this.props;
    switch (key) {
      case 'docs':
        dispatch(routerRedux.push('/list/search'));
        break;
      case 'app':
        dispatch(routerRedux.push('/list/filter-card-list'));
        break;
      case 'project':
        dispatch(routerRedux.push('/list/cover-card-list'));
        break;
      default:
        break;
    }
  }

  render() {
    const { form, monitor } = this.props;
    const { tags } = monitor;

    /**
     * @constant { boolean } spinning - 当前页面加载状态
     * @constant { string } tip - 当前页面加载状态文本
     * @constant { object } listPage - 当前页面列表分页数据结构
     * @constant { Array.<number> } selectedIds - 选择的行数据ids集合
     * @constant { Array.<object> } selectedRows - 选择的行数据集合
     * */
    const { spinning, tip, listPage = {},
      initialDataStatus = '', listPageStatus = '',
      selectedRows } = this.state;

    const { rows = [] } = listPage;

    const { getFieldDecorator } = form;

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

    const tabList = [
      {
        key: 'doc',
        tab: '文章',
      },
      {
        key: 'app',
        tab: '应用',
      },
      {
        key: 'project',
        tab: '项目',
      },
    ];

    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 8 }} />
        {text}
      </span>
    );

    const ListContent = ({ data: { content, updatedAt, avatar, owner, href } }) => (
      <div className={styles.listContent}>
        <div className={styles.description}>{content}</div>
        <div className={styles.extra}>
          <Avatar src={avatar} size="small" /><a href={href}>{owner}</a> 发布在 <a href={href}>{href}</a>
          <em>{moment(updatedAt).format('YYYY-MM-DD hh:mm')}</em>
        </div>
      </div>
    );

    const pageHeaderContent = (
      <div style={{ textAlign: 'center' }}>
        <Input.Search
          placeholder="请输入"
          enterButton="搜索"
          size="large"
          onSearch={this.handleFormSubmit}
          style={{ width: 522 }}
        />
      </div>
    );

    const formItemLayout = {
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 12 },
      },
    };

    const loadMore = rows.length > 0 ? (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button onClick={this.fetchMore} style={{ paddingLeft: 48, paddingRight: 48 }}>
          {loading ? <span><Icon type="loading" /> 加载中...</span> : '加载更多'}
        </Button>
      </div>
    ) : null;

    return (
      <PageHeaderLayout>
        <Row>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card title="设备分布情况" style={{ marginBottom: 24 }} bordered={false}>
              <MapChart
                height={400}
                data={[]}/>
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="设备分布情况" bordered={false}>
              <Row>
                <Col md={6} sm={12} xs={24}>
                  <NumberInfo
                    subTitle="总设备数"
                    suffix="台"
                    total={numeral(21563).format('0,0')}
                  />
                </Col>
                <Col md={6} sm={12} xs={24}>
                  <NumberInfo
                    subTitle="在线设备数"
                    suffix="台"
                    total={numeral(19753).format('0,0')}
                  />
                </Col>
                <Col md={6} sm={12} xs={24}>
                  <NumberInfo
                    subTitle="异常设备数"
                    suffix="台"
                    total={numeral(3).format('0,0')}
                  />
                </Col>
                <Col md={6} sm={12} xs={24}>
                  <TimeDisplay
                  subTitle="当前时间"/>
                </Col>
               {/* <Col md={6} sm={12} xs={24}>
                  <NumberInfo
                    subTitle="活动剩余时间"
                    total={<CountDown target={targetTime} />}
                  />
                </Col>
                <Col md={6} sm={12} xs={24}>
                  <NumberInfo
                    subTitle="每秒交易总额"
                    suffix="元"
                    total={numeral(234).format('0,0')}
                  />
                </Col>*/}
              </Row>
              {/*<div className={styles.mapChart}>
                <Tooltip title="等待后期实现">
                  <img src="https://gw.alipayobjects.com/zos/rmsportal/HBWnDEUXCnGnGrRfrpKa.png" alt="map" />
                </Tooltip>
              </div>*/}
            </Card>
          </Col>
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

        <Row>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card title="设备开机时效情况" style={{ marginBottom: 24 }} bordered={false}>
              <MapChart
                height={400}
                data={[]}  />
            </Card>
          </Col>
        </Row>

        <Row>
          <div>
            <div>
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
                              {
                                owners.map(owner =>
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
                  <StandardFormRow
                    title="其它选项"
                    grid
                    last
                  >
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


              <Card
                style={{ marginTop: 24 }}
                bordered={false}
                bodyStyle={{ padding: '8px 32px 32px 32px' }}
              >
                <List
                  size="large"
                  loading={spinning}
                  rowKey="id"
                  itemLayout="vertical"
                  loadMore={loadMore}
                  dataSource={rows}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <IconText type="star-o" text={item.star} />,
                        <IconText type="like-o" text={item.like} />,
                        <IconText type="message" text={item.message} />,
                      ]}
                      extra={<div className={styles.listItemExtra} />}
                    >
                      <List.Item.Meta
                        title={(
                          <a className={styles.listItemMetaTitle} href={item.href}>{item.title}</a>
                        )}
                        description={
                          <span>
                        <Tag>Ant Design</Tag>
                        <Tag>设计语言</Tag>
                        <Tag>蚂蚁金服</Tag>
                      </span>
                        }
                      />
                      <ListContent data={item} />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </div>
        </Row>
      {/*  <Row gutter={24}>
          <Col xl={12} lg={24} sm={24} xs={24}>
            <Card
              title="各品类占比"
              style={{ marginBottom: 24 }}
              bordered={false}
              className={styles.pieCard}
            >
              <Row gutter={4} style={{ padding: '16px 0' }}>
                <Col span={8}>
                  <Pie
                    animate={false}
                    percent={28}
                    subTitle="中式快餐"
                    total="28%"
                    height={128}
                    lineWidth={2}
                  />
                </Col>
                <Col span={8}>
                  <Pie
                    animate={false}
                    color="#5DDECF"
                    percent={22}
                    subTitle="西餐"
                    total="22%"
                    height={128}
                    lineWidth={2}
                  />
                </Col>
                <Col span={8}>
                  <Pie
                    animate={false}
                    color="#2FC25B"
                    percent={32}
                    subTitle="火锅"
                    total="32%"
                    height={128}
                    lineWidth={2}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xl={6} lg={12} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="热门搜索" bordered={false} bodyStyle={{ overflow: 'hidden' }}>
              <TagCloud
                data={tags}
                height={161}
              />
            </Card>
          </Col>
          <Col xl={6} lg={12} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="资源剩余" bodyStyle={{ textAlign: 'center', fontSize: 0 }} bordered={false}>
              <WaterWave
                height={161}
                title="补贴资金剩余"
                percent={34}
              />
            </Card>
          </Col>
        </Row>*/}
      </PageHeaderLayout>
    );
  }
}
