import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button, Icon} from 'antd'

function ResetButton({prefix, className, style, children, shape, type, icon, loading, ghost, onClick, ...props}){
    return (
        <Button
            className={className}
            type={type}
            shape={shape}
            loading={loading}
            ghost={ghost}
            onClick={onClick}
            icon={icon}
            {...props}>
            {children}
        </Button>
    )
}

ResetButton.propTypes = {
    prefix: PropTypes.string,
    children: PropTypes.any,
    type: PropTypes.string,
    shape: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.string,
    loading: PropTypes.bool,
    ghost: PropTypes.bool,
    size: PropTypes.string,
    onClick: PropTypes.func,

    className: PropTypes.string,
    style: PropTypes.object,
};

ResetButton.defaultProps = {
    prefix: 'yzh',
    type: false,
    shape: false,
    icon: 'reload',
    children: '重置',
    loading: false,
    ghost: false,
};

export default ResetButton
