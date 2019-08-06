import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Card, Select, List, Tag, Icon, Avatar, Row, Col, Button, Input } from 'antd';

import { ButtonContainer } from '../../compoents2/';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import StandardFormRow from '../../components/StandardFormRow';
import TagSelect from '../../components/TagSelect';
import styles from './ShenHe.less';

const { Option } = Select;
const FormItem = Form.Item;

const pageSize = 5;

@Form.create()
@connect(state => ({
  list: state.list,
}))
export default class SearchList extends Component {
  componentDidMount() {
    this.fetchMore();
  }

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
    const { form, list: { list, loading } } = this.props;
    const { getFieldDecorator } = form;

    const tabList = [
      {
        key: 'doc',
        tab: '未审核',
      },
      {
        key: 'app',
        tab: '已通过',
      },
      {
        key: 'project',
        tab: '已拒绝',
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
          {/*          <Avatar src={avatar} size="small" /><a href={href}>{owner}</a> 发布在 <a href={href}>{href}</a>*/}
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

    const loadMore = list.length > 0 ? (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button onClick={this.fetchMore} style={{ paddingLeft: 48, paddingRight: 48 }}>
          {loading ? <span><Icon type="loading" /> 加载中...</span> : '加载更多'}
        </Button>
      </div>
    ) : null;

    return (
      <PageHeaderLayout
        // title="搜索列表"
        content={pageHeaderContent}
        tabList={tabList}
        // onTabChange={this.handleTabChange}
      >
        <div>
          <Card
            style={{ marginTop: 24 }}
            bordered={false}
            bodyStyle={{ padding: '8px 32px 32px 32px' }}
          >
            <List
              size="large"
              loading={list.length === 0 ? loading : false}
              rowKey="id"
              itemLayout="vertical"
              loadMore={loadMore}
              dataSource={list}
              renderItem={item => (
                <List.Item
                  key={item.id}
                 /* actions={[
                    <IconText type="star-o" text={item.star} />,
                    <IconText type="like-o" text={item.like} />,
                    <IconText type="message" text={item.message} />,
                  ]}*/
                  extra={<div className={styles.listItemExtra}>
                    <ButtonContainer>
                      <Button type={"primary"} style={{backgroundColor: "green"}}>通过</Button>
                      <Button type={"danger"}>拒绝</Button>
                    </ButtonContainer>
                  </div>}
                >
                  <List.Item.Meta
                    title={(
                      <a className={styles.listItemMetaTitle} href={item.href}>{item.title}</a>
                    )}
                    description={
                      <span>
                        <Tag>客服</Tag>
                      </span>
                    }
                  />
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
