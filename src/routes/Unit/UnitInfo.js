import React, { PureComponent } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker,
  Modal, message, Badge, Tag } from 'antd';
import { TimeDisplay, MapChart, ButtonContainer } from '../../compoents2/';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './UnitInfo.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
  unitData: state.unitData,
}))
@Form.create()
export default class UnitInfo extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  tagType = ['潜在', '目标', '普通', '意向', '高级', '非目标用户', 'VIP'];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'unitData/fetch',
    });
  }

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
          <Col md={6} sm={24}>
            <FormItem label="机构标签">
              {getFieldDecorator('detectProject', {
                initialValue: 0,
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value={0}>全部</Select.Option>
                  { this.tagType.map( (tagText, i) => {
                    return  <Select.Option value={ i }>{ tagText }</Select.Option>
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="所在位置">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="所在地区">
              {getFieldDecorator('sn')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <span className={styles.submitButtons} style={{ marginTop: 8}}>
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
            <FormItem label="机构标签">
              {getFieldDecorator('detectProject', {
                initialValue: 0,
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value={0}>全部</Select.Option>
                  { this.tagType.map( (tagText, i) => {
                    return  <Select.Option value={ i }>{ tagText }</Select.Option>
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="所在位置">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="所在地区">
              {getFieldDecorator('sn')(
                <Input placeholder="请输入" />
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

  render() {
    const { form } = this.props;

    const { getFieldDecorator } = form;

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
    const { unitData: { loading, unitInfoData } } = this.props;
    const { modalVisible, addInputValue } = this.state;

    const statusMap = ['default', 'processing', 'success', 'error'];

    const columns = [
      {
        title: '单位编号',
        dataIndex: 'orgSn',
      },
      {
        title: '单位名称',
        dataIndex: 'orgName',
      },
      {
        title: '所在地区',
        dataIndex: 'area',
      },
      {
        title: '单位标记',
        dataIndex: 'tagType',
        filters: [
          {
            text: this.tagType[0],
            value: 0,
          },
          {
            text: this.tagType[1],
            value: 1,
          },
          {
            text: this.tagType[2],
            value: 2,
          },
          {
            text: this.tagType[3],
            value: 3,
          },
          {
            text: this.tagType[4],
            value: 4,
          },
          {
            text: this.tagType[5],
            value: 5,
          },
          {
            text: this.tagType[6],
            value: 6,
          },
        ],
        render: (val) => {
          return  <Tag>{this.tagType[val]}</Tag>
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: () => (
          <div>
            <ButtonContainer>
              <Button type={"primary"}>员工列表</Button>
            </ButtonContainer>
          </div>
        ),
      },
    ];


    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量设置</Menu.Item>
      </Menu>
    );

    return (
      <PageHeaderLayout >
        <Card bordered={false}>
          <Card bordered={false}>
            { this.renderForm() }
          </Card>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>新建</Button>
              <Button type={"primary"} >查看</Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button>批量操作</Button>
                    <Dropdown overlay={menu}>
                      <Button>
                        更多操作 <Icon type="down" />
                      </Button>
                    </Dropdown>
                  </span>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={ loading }
              // data={ zhiKongData }
              dataSource={ unitInfoData }
              columns={ columns }
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
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
