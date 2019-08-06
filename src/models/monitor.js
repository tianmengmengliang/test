import { queryTags } from '../services/api';

/*
 *  三、reducer函数，接收Action 和 Store作为参数。
 * */
export default {
  namespace: 'monitor',   //Action的名称。
  state: {
    tags: [],
    list: [],
  },
  effects: {
    *fetchTags(_, { call, put }) {
      const response = yield call(queryTags);
      yield put({
        type: 'saveTags',
        payload: response.list,
      });
    },
  },


  reducers: {
    saveTags(state, action) {  //创建一个新的state。
      return {
        ...state,
        tags: action.payload,
      };
    },
  },
};
