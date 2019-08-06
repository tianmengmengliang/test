import React, { Component,  } from 'react'; //PropTypes
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid';
import cx from 'classnames'
import {Pagination, Spin} from 'antd'
import './gridTable.less'

// React创建组件的一种方式:
/*const EmptyRowsView = React.createClass({ //React版本16以后,暂时还不知道怎样这么写。
    render() {
      return (<div className="ant-table-placeholder"><span><i className="anticon anticon-frown-o"></i>暂无数据</span></div>);
    }
});*/

// React创建组件的第二种方式:
export class EmptyRowsView extends Component {
  render() {
    return (<div className="ant-table-placeholder"><span><i className="anticon anticon-frown-o"></i>暂无数据</span></div>);
  }
}

class GridTable extends Component{
    constructor(props){
        super(props);
        this.state = {}
    }

    rowGetter = (index)=> {
        // console.log(this.getRowCount());
        if (index < 0 || index > this.getRowCount()) {
            return undefined;
        }
        return this.props.dataSource[index]
    };

    getRowCount = ()=> {
        const {dataSource} = this.props;
        return (dataSource && dataSource.length) || 0
    };

    render(){
        const {style, minWidth, minHeight, headerRowHeight, rowHeight, rowRenderer, columns,
            enableRowSelect, enableCellSelect, rowKey, rowScrollTimeout, rowSelection,
            emptyRowsView,
            onRowUpdated, onRowClick,
            onGridSort,onAddFilter,onClearFilters,onGridRowsUpdated,
            width, maxWidth, className, pagination, tableLoading, delay,
            ...props} = this.props;
        const resolvedColumns = columns.map((column)=>{
            let _F, Formatter = column.formatter;
            if(typeof Formatter === 'function'){
                _F = <Formatter />;
            }
            else if(_F && typeof _F.type !== 'function'){
                _F = undefined
            }
            return Object.assign({}, {resizable: true}, column, {getRowMetaData:(rowData, column)=>{ return rowData}, formatter: _F})
        });

        const cls = `${cx({
            'yzh-data-grid-container': true
        })} ${typeof className === 'string' ? className : ''}`;
        const styles = {
            width: typeof width === 'number' ? `${width}px` : typeof width === 'string' ? width : 'auto',
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : typeof maxWidth === 'string' ? maxWidth : 'auto'
        };
        const resolvedMinHeight = minHeight === 'auto' ? 52+this.getRowCount()*rowHeight : minHeight;
        // console.log(resolvedColumns, this.getRowCount());
        return (
            <div className={cls} style={Object.assign({}, style, styles)} size={'large'}>
                <Spin spinning={ !!tableLoading } delay={delay} >
                    <ReactDataGrid
                        width={width}
                        maxWidth={maxWidth}
                        minWidth={minWidth}
                        minHeight={resolvedMinHeight}
                        headerRowHeight={headerRowHeight}
                        rowScrollTimeout={rowScrollTimeout}
                        enableCellSelect={enableCellSelect}
                        enableRowSelect={enableRowSelect}
                        rowKey={rowKey}
                        columns={resolvedColumns}
                        rowGetter={this.rowGetter}
                        rowsCount={this.getRowCount()}
                        rowHeight={rowHeight}
                        rowRenderer={rowRenderer}
                        rowSelection={rowSelection}
                        onRowUpdated={onRowUpdated}
                        onRowClick={onRowClick}
                        emptyRowsView={emptyRowsView || EmptyRowsView}
                        onGridRowsUpdated={onGridRowsUpdated}
                        onAddFilter={onAddFilter}
                        onClearFilters={onClearFilters}
                        onGridSort={onGridSort}
                       />
                </Spin>
                <div className={'yzh-data-grid-pagination'}>
                    <Pagination {...pagination}/>
                </div>
            </div>
        )
    }
}

GridTable.propTypes = {
    width: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),                                                                                 // DataGrid宽度
    maxWidth: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),                                                                                 // DataGrid最大宽度
    className: PropTypes.string,
    dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,                         // 数据源
    pagination: PropTypes.shape({
        current: PropTypes.number.isRequired,
        defaultCurrent: PropTypes.number,
        total: PropTypes.number.isRequired,
        defaultPageSize: PropTypes.number,
        pageSize: PropTypes.number,
        onChange: PropTypes.func,
        showSizeChanger: PropTypes.bool,
        onShowSizeChange: PropTypes.func,
        size: PropTypes.string,
        simple: PropTypes.object,
        pageSizeOptions: PropTypes.array,
        showTotal: PropTypes.func
    }).isRequired,
    tableLoading: PropTypes.bool,                                                       // table加载loading状态
    delay: PropTypes.number.isRequired,                                                 // table加载loading状态延迟时间

   /* totalWidth: PropTypes.oneOfType([
     PropTypes.number,
     PropTypes.string
     ]).isRequired,   */                                                                // DataGrid宽度
    minHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.oneOf(['auto'])
    ]).isRequired,
    minWidth: PropTypes.number,
    headerRowHeight: PropTypes.number,
    rowHeight: PropTypes.number.isRequired,
    rowGetter: PropTypes.func,
    // rowGetter: PropTypes.func.isRequired,
    rowsCount: PropTypes.number,
    // rowsCount: PropTypes.number.isRequired,
    rowRenderer: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func
    ]),
    columns: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,

    enableRowSelect: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    enableCellSelect: PropTypes.bool,
    onCellSelected: PropTypes.func,
    onCellDeSelected: PropTypes.func,

    rowKey: PropTypes.string,
    rowScrollTimeout: PropTypes.number,
    rowGroupRenderer: PropTypes.func,
    rowActionsCell: PropTypes.func,
    onRowUpdated: PropTypes.func,
    onRowClick:  PropTypes.func,
    onRowSelect:  PropTypes.func,
    onRowExpandToggle:  PropTypes.func,

    toolbar:  PropTypes.element,
    /*onFilter:  PropTypes.func,*/
    onCellCopyPaste:  PropTypes.func,
    onCellsDragged:  PropTypes.func,
    onCellExpand:  PropTypes.func,
    onAddFilter:  PropTypes.func,
    onGridSort:  PropTypes.func,
    onDragHandleDoubleClick:  PropTypes.func,
    onGridRowsUpdated:  PropTypes.func,

    onClearFilters: PropTypes.func,
    contextMenu: PropTypes.element,
    cellNavigationMode: PropTypes.oneOf(['none', 'loopOverRow', 'changeRow']),

    /*enableDragAndDrop:  PropTypes.bool,*/

    rowSelection: PropTypes.shape({
        enableShiftSelect: PropTypes.bool,
        onRowsSelected: PropTypes.func,
        onRowsDeselected: PropTypes.func,
        showCheckbox: PropTypes.bool,
        selectBy: PropTypes.oneOfType([
             PropTypes.shape({
                indexes: PropTypes.arrayOf(PropTypes.number).isRequired
            }),
             PropTypes.shape({
                isSelectedKey: PropTypes.string.isRequired
            }),
            PropTypes.shape({
                keys: PropTypes.shape({
                    values: PropTypes.array.isRequired,
                    rowKey: PropTypes.string.isRequired
                }).isRequired
            })
        ]).isRequired
    }),

    onCheckCellIsEditable: PropTypes.func,

    /* called before cell is set active, returns a boolean to determine whether cell is editable */
    overScan: PropTypes.object
};

GridTable.defaultProps = {
    pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: false
    },
    delay: 0,
    enableRowSelect: false,
    enableCellSelect: false,
    rowHeight: 35,
    minHeight: 350,
    // totalWidth: 'auto',
    rowKey: 'id',
    rowScrollTimeout: 0,
    tabIndex: -1,
    cellNavigationMode: 'none',
    overScan: {
        colsStart: 5,
        colsEnd: 5,
        rowsStart: 5,
        rowsEnd: 5
    }
};

export default GridTable;
