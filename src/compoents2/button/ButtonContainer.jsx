import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames'
import './ButtonContainer.less'

function _mapTypeToClsStr(type){
  if(type === 'form') return '-form';
  return ''
}
function ButtonContainer({prefix, children, className, type,  inline, ...props}){
    const typeStr = _mapTypeToClsStr(type);
    const cls = cx({
      [`${prefix}-button-container`]: true,
      [`${prefix}${typeStr}-button-container`]: true
    });
    const style = {
      display: inline ? 'inline-block' : 'block',
      margin: inline ? '0 16px' : '0',
    };
    return (
        <div className={`${cls} ${className === undefined ? '' : className}`} {...props} //style={style}
        >
          {children}
        </div>
    )
}

ButtonContainer.propTypes = {
  prefix: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.string,
  inline: PropTypes.bool,
};

ButtonContainer.defaultProps = {
  prefix: 'yzh-d',
  type: 'primary',
  /** 是否内联布局 */
  inline: false,
};

export default ButtonContainer;
