import React, { PureComponent } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge } from 'antd';
import { TimeDisplay, MapChart } from '../../compoents2/';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './DetectData.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
  detectData: state.detectData,
}))
@Form.create()


export default class DetectData extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'detectData/fetchZhiKongData',
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
            <FormItem label="设备号">
              {getFieldDecorator('detectProject', {
                initialValue: "全部",
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value="全部">全部</Select.Option>
                  <Select.Option value="CRP">CRP</Select.Option>
                  <Select.Option value="PCT">PCT</Select.Option>
                  <Select.Option value={"HCG"}>HCG</Select.Option>
                  <Select.Option value={"PCT"}>PCT</Select.Option>
                  <Select.Option value={"AFP"}>AFP</Select.Option>
                  <Select.Option value={"PSA"}>PSA</Select.Option>
                  <Select.Option value={"其他"}>其他</Select.Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="设备号">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="机构名称">
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
            <FormItem label="设备号">
              {getFieldDecorator('detectProject', {
                initialValue: "全部",
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Select.Option value="全部">全部</Select.Option>
                  <Select.Option value="CRP">CRP</Select.Option>
                  <Select.Option value="PCT">PCT</Select.Option>
                  <Select.Option value={"HCG"}>HCG</Select.Option>
                  <Select.Option value={"PCT"}>PCT</Select.Option>
                  <Select.Option value={"AFP"}>AFP</Select.Option>
                  <Select.Option value={"PSA"}>PSA</Select.Option>
                  <Select.Option value={"其他"}>其他</Select.Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="设备号">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="机构名称">
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
    const { detectData: { loading: ruleLoading,  zhiKongData } } = this.props;
    const { modalVisible, addInputValue } = this.state;

    const statusMap = ['default', 'processing', 'success', 'error'];
    const status = ['正常', '偏高', '偏低'];

    const columns = [
      {
        title: '设备编号',
        dataIndex: 'deviceSn',
      },
      {
        title: '所属机构',
        dataIndex: 'orgName',
      },
      {
        title: '所在地区',
        dataIndex: 'area',
      },
      {
        title: '检测项目',
        dataIndex: 'detectProject',
      },
      {
        title: '检测原始数据',
        dataIndex: 'originData',
      },
      {
        title: '状态',
        dataIndex: 'status',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
          {
            text: status[2],
            value: 2,
          },
          {
            text: status[3],
            value: 3,
          },
        ],
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
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
            <a href="">查看</a>
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
              loading={ ruleLoading }
              // data={ zhiKongData }
              dataSource={ zhiKongData }
              columns={ columns }
              rowSelection={ null }
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
