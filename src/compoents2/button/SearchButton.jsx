import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button, Icon} from 'antd'

function SearchButton({prefix, className, style, children, shape, type, icon, loading, ghost, onClick, ...props}){
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

SearchButton.propTypes = {
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

SearchButton.defaultProps = {
    prefix: 'yzh',
    type: 'primary',
    shape: null ,  //false
    icon: 'search',
    children: '查找',
    loading: false,
    ghost: false,
};

export default SearchButton
