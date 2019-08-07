import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Tabs, Button, Icon, Checkbox, Row, Col, Alert, message, } from 'antd';
import styles from './Login.less';
const FormItem = Form.Item;
const { TabPane } = Tabs;
import {fetch,CONFIG }from '../../services/'
const {token, user, lsNames,} = CONFIG;//获取token名。


@connect(state => ({
  login: state.login,
}))
@Form.create()
export default class Login extends Component {
  state = {
    count: 0,
    type: 'account', //账户登录/手机号登录
    login: {
      status: 'ok',      //成功还是失败
      submitting: false, //是否加中。
    }
  }
  componentWillReceiveProps(nextProps) {
    /*if (nextProps.login.status === 'ok') {
      this.props.dispatch(routerRedux.push('/'));
    }*/
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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
         if (!err){
        //   const { remember } = values;
        //   this.getUserLogin({...values}, (err, res ={})=> {
        //     if(err){
        //       message.error(err.message ||'登录失败');
        //       return;
        //     }
        //     //------------------------------------------------
        //     //1.保存token、 用户角色信息。
        //     const {responseObject } = res;
        //     //console.log('登录:', responseObject);
        //     //
        //     localStorage.setItem(token,  responseObject['token']);
        //     localStorage.setItem(lsNames.platform.USER_ROLE,  JSON.stringify( responseObject['employee']));

        //     //2.要求免面登录.
        //     if (remember) {
        //       console.log('判断是免登录.');
        //       localStorage.setItem(user,  JSON.stringify(values));
        //       this.props.dispatch(routerRedux.push('/layout'));
        //     }else {
        //       this.props.dispatch( routerRedux.push('/layout'));
        //     }
        //  });
           if(values.userName ==='111' && values.password ==='123') {
            if (remember) {
              console.log('判断是免登录。');
            }
            this.props.dispatch(  routerRedux.push('/layout/form/advanced-form'));
          }
        }
    });
  }

  //1.登录请求接口
  getUserLogin= ( selectedId = {}, callback= ()=>{})=>{
    //console.log("登录请求参数：", selectedId);
    fetch('userInfo/login', {
      data: selectedId,
      success: (res)=>{
        callback && callback(null, res);
      },
      error: (err)=>{
        callback && callback(err, null);
        this.setState({
          login: {
            status: 'error',  //成功还是失败
            submitting: false, //否加中。
          }
        });
      },
      beforeSend: ()=>{
        this.setState({
          login: {
            submitting: true, //是加中。
          }
        });
      },
      complete: (err, res)=>{
        this.setState({
          login: {
            submitting: false, //不加载。
          }
        });
      }
    })
  };



  renderMessage = (message) => {
    return (
      <Alert style={{ marginBottom: 24 }}
        message={message}
        type="error"
        showIcon
      />
    );
  }

  render() {
    const { form, } = this.props;
    const { getFieldDecorator } = form;
    const { count, type, login} = this.state;

    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <Tabs animated={false} className={styles.tabs} activeKey={type} onChange={this.onSwitch}>
            <TabPane tab="账户密码登录" key="account">
              {
                login.status === 'error' &&
                type === 'account' &&
                login.submitting === false &&
                this.renderMessage('账户或密码错误')
              }
              <FormItem>
                {getFieldDecorator('userName', {
                  rules: [{
                    required: type==='account', message: '请输入账户名！',
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
            <TabPane tab="手机号登录" key="mobile">
              {
                login.status === 'error' &&
                login.type === 'mobile' &&
                login.submitting === false &&
                this.renderMessage('验证码错误')
              }
              <FormItem>
                {getFieldDecorator('mobile', {
                  rules: [{
                    required: type === 'mobile', message: '请输入手机号！',
                  }, {
                    pattern: /^1\d{10}$/, message: '手机号格式错误！',
                  }],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="mobile" className={styles.prefixIcon} />}
                    placeholder="手机号"
                  />
                )}
              </FormItem>
              <FormItem>
                <Row gutter={8}>
                  <Col span={16}>
                    {getFieldDecorator('captcha', {
                      rules: [{
                        required: type === 'mobile', message: '请输入验证码！',
                      }],
                    })(
                      <Input
                        size="large"
                        prefix={<Icon type="mail" className={styles.prefixIcon} />}
                        placeholder="验证码"
                      />
                    )}
                  </Col>
                  <Col span={8}>
                    <Button
                      disabled={count}
                      className={styles.getCaptcha}
                      size="large"
                      onClick={this.onGetCaptcha}
                    >
                      {count ? `${count} s` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </TabPane>
          </Tabs>
          <FormItem className={styles.additional}>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: false,
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
