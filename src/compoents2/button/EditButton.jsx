import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button, Icon} from 'antd'

function EditButton({prefix, className, style, children, shape, type, icon, loading, ghost, onClick, ...props}){
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

EditButton.propTypes = {
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

EditButton.defaultProps = {
    prefix: 'yzh',
    type: 'primary',
    shape: false,
    icon: 'edit',
    children: '编辑',
    loading: false,
    ghost: false,
};

export default EditButton
