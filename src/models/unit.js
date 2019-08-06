import { queryFakeUnitData } from '../services/api';

export default {
  namespace: 'unitData',

  state: {
    loading: false,
    unitData: []
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryFakeUnitData);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setter(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        unitData: []
      };
    },
  },
};
