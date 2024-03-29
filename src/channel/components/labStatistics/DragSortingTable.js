import { Table } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

function dragDirection(dragIndex, hoverIndex, initialClientOffset,clientOffset, sourceClientOffset ) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;

  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      dragRow,
      clientOffset,
      sourceClientOffset,
      initialClientOffset,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver && initialClientOffset) {
      const direction = dragDirection(
        dragRow.index,
        restProps.index,
        initialClientOffset,
        clientOffset,
        sourceClientOffset
      );
      if (direction === 'downward') {
        className += ' drop-over-downward';
      }
      if (direction === 'upward') {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};
const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    sourceClientOffset: monitor.getSourceClientOffset(),
  }))(
    DragSource('row', rowSource, (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      dragRow: monitor.getItem(),
      clientOffset: monitor.getClientOffset(),
      initialClientOffset: monitor.getInitialClientOffset(),
    }))(BodyRow)
);

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  }, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  }
];

class DragSortingTable extends React.Component {
  state = {
    data: [],
  }

  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  componentDidMount() {
    console.log("--DragSortTable---componentDidMount-----");
    const data = this.props.data;
    this.setState({
      data,
    })
  }

  componentWillReceiveProps(nextProps){
    console.log("--DragSortTable---componentWillReceiveProps-----");
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if (nextProps.data !== this.props.data) {
      this.setState({
        data: newData.data,
      });
    }
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];
    this.setState(//数据重组。
      update(this.state, {
        data: { $splice: [[dragIndex, 1],  [hoverIndex, 0, dragRow]],},
      })
    );
  }

  render() {
    const {data } = this.state;
    //console.log('排序后的data', data);

    return (
      <Table
        columns={columns}
        dataSource={data}
        components={this.components}
        onRow={(record, index)=> ({index, moveRow: this.moveRow,})}
        pagination={false}
      />
    );
  }
}



const DragTable =  DragDropContext(HTML5Backend)(DragSortingTable);
export default DragTable;
