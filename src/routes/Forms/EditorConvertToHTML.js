/**
 * Created by jpt on 2018/5/2 0002.
 */
import React, { Component } from 'react';
import {Form, Card, Table, Button, Input, message, Popconfirm, Divider, Select, Spin, DatePicker, Modal, notification, Icon, } from 'antd';
//const { TextArea } = Input;
//import { EditorState, convertToRaw, ContentState } from 'draft-js';
//import { Editor } from 'react-draft-wysiwyg';
//import draftToHtml from 'draftjs-to-html';
//import htmlToDraft from 'html-to-draftjs';
import CKEditor from "react-ckeditor-component";

export default class EditorConvertToHTML extends Component {

  constructor(props) {
    super(props);
    this.updateContent = this.updateContent.bind(this);
    this.state = {
      content: 'content',
    }
  }

  updateContent = (newContent)=> {
    this.setState({
      content: newContent,
    })
  }

  onChange = (evt) => {
    console.log("onChange fired with event info: ", evt);
    var newContent = evt.editor.getData();
    this.setState({
      content: newContent
    })
  }

  onBlur =(evt)=>{
    console.log("onBlur event called with event info: ", evt);
  }

  afterPaste =(evt)=>{
    console.log("afterPaste event called with event info: ", evt);
  }

  render() {
    return (
      <CKEditor
        activeClass="p10"
        content={this.state.content}
        events={{
                "blur": this.onBlur,
                "afterPaste": this.afterPaste,
                "change": this.onChange
              }}
      />
    )
  }
}
