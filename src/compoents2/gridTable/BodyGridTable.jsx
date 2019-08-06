import React, { Component } from 'react';  //, PropTypes
import PropTypes from 'prop-types';
import cx from 'classnames'
import 'antd/lib/table/style/index.css'
import 'antd/lib/grid/style/index.css'
import './bodyGridTable.less'

function _formatter(formatter, currentGridMetaData){

    if( typeof formatter === 'function'){
        return formatter(currentGridMetaData)
    }else if(formatter && typeof formatter.type === 'function'){
        return formatter
    }else if(typeof formatter === 'number' || typeof formatter === 'string'){
        return formatter
    }else{
        return currentGridMetaData.title
    }
}

function TableTd({prefix, className, key, title, formatter, rowHeight, required, span, ...props}){

    const cls = cx({
        [`ant-col-${span}`]: true,
        [`${prefix}-body-grid-table-td`]: true
    });
    const content = _formatter(formatter, {key, title, formatter, span, className, ...props})
    const _c = required ? <div className="ant-form-item-required">{content}</div> : content;
    return (
        <td
            {...props}
            style={{float: 'none', height: '100%', lineHeight: `${rowHeight - 16}px`}}
            title={ title}
            className={`${cls} ${className === undefined ? '' : className}`}>{_c}</td>
    )
}

TableTd.propTypes = {
    prefix: PropTypes.string.isRequired,
    className: PropTypes.string,
    key: PropTypes.string.isReuqired,
    title: PropTypes.node,
    formatter: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func
    ]),
    span: PropTypes.number.isRequired,
    required: PropTypes.boolean,
    rowHeight: PropTypes.number.isRequired
};

TableTd.defaultProps ={
    prefix: 'yzh',
    span: 24,
    required: false,
    rowHeight: 72
};

function _renderBodyTableCols(row, rowIndex){

    return row.map((colMetaData, i)=>{
        const {key} = colMetaData;
        return <TableTd {...colMetaData} key={`r${rowIndex} col-${i}`}/>
    })
}

function _renderBodyGridTableRow(row, rowIndex, rowHeight){
    if(row instanceof Array){
        return (
            <TableTr
                rowHeight={rowHeight}
                row={row}
                rowIndex={rowIndex} />
        )
    } else{
        throw new TypeError('renderBodyGridTableRow has a error, BodyGridTable rows element expect a array, but you convert a '+typeof row, row)
    }
}

function TableTr({prefix, className, rowHeight, row, rowIndex, ...props}){

    const cls = cx({
        'ant-table-row ': true
    });
    let maxRowHeight = rowHeight;
    row.forEach((col)=>{
        if(!col.rowHeight || typeof col.rowHeight !== 'number'){
            return;
        }else{
            maxRowHeight = maxRowHeight > col.rowHeight ? maxRowHeight : col.rowHeight;
        }
    });
    const _r = row.map((col)=>{
        return {
            ...col,
            rowHeight: maxRowHeight
        }
    });
    return (
        <tr
            className={`${cls} ${className === undefined ? '' : className}`}
            style={{height: maxRowHeight}}
            row={_r}
            {...props}>{_renderBodyTableCols(_r, rowIndex)}</tr>
    )
}

TableTr.propTypes = {
    prefix: PropTypes.string.isRequired,
    className: PropTypes.string,
    rowIndex: PropTypes.number,
    row: PropTypes.arrayOf(
            PropTypes.shape({
                key: PropTypes.string,
                title: PropTypes.node,
                formatter: PropTypes.oneOfType([
                    PropTypes.element,
                    PropTypes.func
                ]),
                span: PropTypes.number,
                rowHeight: PropTypes.number,
                required: PropTypes.boolean
        }))
};

TableTr.defaultProps ={
    prefix: 'yzh',
    rows: []
};

function _renderBodyGridTableRows(rows, rowHeight){
    if(rows instanceof Array){
        return rows.map((row, i)=>{
                    if(row instanceof Array){
                        return _renderBodyGridTableRow(row, i, rowHeight)
                    } else{
                        return undefined;
                    }
                })
    }else{
        throw new TypeError('the BodyGridTable rows expect a array, but you convert a '+typeof rows, rows)
    }
}
function BodyGridTable({prefix, className, rowHeight, rows, ...props}){

    const tableCls = cx({
        'ant-table': true,
        [`${prefix}-body-grid-table`]: true,
        [`${className}}`]: !!className
    });
    const tBodyCls = cx({
        'ant-table-tbody': true
    });
    return (
        <table
            {...props}
            className={`${tableCls}`}>
            <tBody
                className={`${tBodyCls}`}>
            {_renderBodyGridTableRows(rows, rowHeight)}
            </tBody>
        </table>
    )
}

BodyGridTable.propType = {
    prefix: PropTypes.string.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    rowHeight: PropTypes.number,
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        span: PropTypes.number,
        required: PropTypes.boolean,
        rowHeight: PropTypes.number,
        title: PropTypes.title,
        formatter: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.element
        ])
    }))).isRequired
};

BodyGridTable.defaultProps = {
    prefix: 'yzh',
    rowHeight: 68,
    rows: []
};

export {
    BodyGridTable
}

export default BodyGridTable
