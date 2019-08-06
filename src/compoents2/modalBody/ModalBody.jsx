import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames'
import './modalBody.less'

function ModalContent({children, className, style, height, fixHeight, minHeight, prefix,  ...props}){
    const cls = cx({
        [`${prefix}-modal-body`]: true
    });
    let styles = {
        minHeight: height === 'auto' ? minHeight : height,
        height: height
    };
    if(fixHeight){
        if(height === 'auto'){
            styles = Object.assign({}, styles, {
                height: minHeight,
                overflow: 'auto'
            })
        }else{
            styles = Object.assign({}, styles, {
                height: height,
                overflow: 'auto'
            })
        }
    }
    return (
        <div
            {...props}
            className={`${cls} ${className ? className : ''}`}
            style={{marginTop: 0, paddingLeft: 8, paddingRight: 8, ...styles, ...style}}
           >
            {children}
        </div>
    )
}

ModalContent.propTypes = {
    prefix: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    height: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]).isRequired,
    fixHeight: PropTypes.bool,
    minHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]).isRequired
};

ModalContent.defaultProps = {
    prefix: 'yzh-d',
    style: {
        padding: '0 8px'
    },
    height: 'auto',
    fixHeight: false,
    minHeight: 500
};

export default ModalContent;

