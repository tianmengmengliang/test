import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Router, Route, Switch,   routerRedux, Link } from 'dva/router';
import createHistory from "history/createBrowserHistory"
const history = createHistory();
import { Form, Input, Tabs, Button, Icon, Checkbox, Row, Col, Alert } from 'antd';
import styles from './Login.less';
const FormItem = Form.Item;
const { TabPane } = Tabs;


export default class Login extends Component {

  _retInitialState = ()=> {
    return {
      count: 0,
      type: 'account',
      login:{
        status: '',
        type: 'account',
        submitting: false,     //加载完毕。
      },
    }
  }

  constructor(props) {
    super(props);
    this.state = this._retInitialState();
  }

  componentWillReceiveProps(nextProps) {
    //if (nextProps.login.status === 'ok') {
    //  this.props.dispatch( routerRedux.push('/'));
    //}
    const user = JSON.parse(localStorage.getItem('user')); //转json
    console.log('是免登录',user);
    if(user!== null){
      if(user.remember){//判断是免登录。
        //localStorage.removeItem("user");
        history.push('/#/user/lis');
        console.log('==状态发生变化时history：',history);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  componentDidMount(){
    const user = JSON.parse(localStorage.getItem('user')); //转json
    console.log('是免登录',user);
    if(user!== null){
      if(user.remember){//判断是免登录。
         //localStorage.removeItem("user");
         history.push('/#/user/lis');
         console.log('组件加载完成时history：',history);
      }
    }
  }

  onSwitch = (key) => {
    this.setState({
      type: key,
    });
  }

  onGetCaptcha = () => {
    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { type } = this.state;
    this.props.form.validateFields({ force: true },(err, values) => {
        if (!err) {
          //console.log('登录请求：',values);
          if(values.userName ==='111' && values.password ==='123'){
            console.log('匹配ok：',values);
            localStorage.setItem('user',  JSON.stringify(values));
            this.setState({
              login:{
                status: 'success',
                type: type,
                submitting: false,     //加载完毕。
              },
            });
            console.log('点击登录history：',history);
            //history.push('/#/lisCloud/lisLaboratory');
          }
          else{
            this.setState({
              login:{
                status: 'error',
                type: type,
                submitting: false,     //加载完毕。
              },
            });
          }
        }
      }
    );
  }

  renderMessage = (message) => {
    return (
      <Alert
        style={{ marginBottom: 24 }}
        message={message}
        type="error"
        showIcon
      />
    );
  }

  render() {
    const { form,  } = this.props;
    const { getFieldDecorator } = form;
    const { count, type, login } = this.state;

    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <Tabs animated={false} className={styles.tabs} activeKey={type} onChange={this.onSwitch}>
            <TabPane tab="账户密码登录" key="account">
              {
                login.status === 'error' &&
                login.type === 'account' &&
                login.submitting === false &&
                this.renderMessage('账户或密码错误')
              }
              <FormItem>
                {getFieldDecorator('userName', {
                  rules: [{
                    required: type === 'account', message: '请输入账户名！',
                  }],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="user" className={styles.prefixIcon} />}
                    placeholder="admin"
                  />
                )}
              </FormItem>

              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{
                    required: type === 'account', message: '请输入密码！',
                  }],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="lock" className={styles.prefixIcon} />}
                    type="password"
                    placeholder="888888"
                  />
                )}
              </FormItem>
            </TabPane>
          </Tabs>
          <FormItem className={styles.additional}>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox className={styles.autoLogin}>自动登录</Checkbox>
            )}
            <a className={styles.forgot} href="">忘记密码</a>
            <Button size="large" loading={login.submitting} className={styles.submit} type="primary" htmlType="submit">
              登录
            </Button>
          </FormItem>
        </Form>
        <div className={styles.other}>
          其他登录方式
          {/* 需要加到 Icon 中 */}
          <span className={styles.iconAlipay} />
          <span className={styles.iconTaobao} />
          <span className={styles.iconWeibo} />
          <Link className={styles.register} to="/user/register">注册账户</Link>
        </div>
      </div>
    );
  }
}
//Login.contextTypes  = {
//  router: PropTypes.object.isRequired,
//};


Login = Form.create()(Login);
