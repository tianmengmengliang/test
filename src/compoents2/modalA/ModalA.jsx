import React, { Component,  } from 'react';  //PropTypes
import PropTypes from 'prop-types';
import cx from 'classnames'
import {Modal} from 'antd'
import ModalBody from '../modalBody/'

function noop(){}

function ModalA({prefix, className, style, width, children, hasDefaultStyle, fixHeight, bodyStyle, bodyHeight, bodyMinHeight,  ...props}){
    const cls = cx({
        [`${prefix}-modal-a`]: true
    });
    let resolvedStyle;
    if(hasDefaultStyle){
        resolvedStyle = style
    }else{
        delete style.top;
        resolvedStyle = Object.assign({}, style)
    }
    return (
        <Modal
            width={width}
            maskClosable={false}
            {...props}
            className={`${cls} ${className ? className : ''}`}
            style={Object.assign({}, resolvedStyle, style)}
           >
            <ModalBody
                height={bodyHeight}
                minHeight={bodyMinHeight}
                fixHeight={fixHeight}
                style={bodyStyle}>
                {children}
            </ModalBody>
        </Modal>
    )
}

ModalA.propTypes = {
    prefix: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    visible: PropTypes.bool,
    bodyHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    bodyMinHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    fixHeight: PropTypes.bool,
    minHeight: PropTypes.number,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    confirmLoading: PropTypes.bool,

    style: PropTypes.object,
    bodyStyle: PropTypes.object,
    hasDefaultStyle: PropTypes.bool.isRequired,
    width: PropTypes.any,
    footer: PropTypes.any,
    maskClosable: PropTypes.bool,
    closable: PropTypes.bool,
    afterClose: PropTypes.func
};

ModalA.defaultProps = {
    prefix: 'yzh-d',
    title: '',
    visible: false,
    confirmLoading: false,
    okText: '确定',
    cancelText: '取消',
    style: {top: '20px'},
    bodyStyle: {},
    hasDefaultStyle: true,
    width: 1000,
    fixHeight: false,
    bodyHeight: 'auto',
    bodyMinHeight: 500
};

export default ModalA;
