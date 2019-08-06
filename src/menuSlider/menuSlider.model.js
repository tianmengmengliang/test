
export default {
    namespace: 'menuSlider',
    state: {
        collapsed: false
    },
    subscriptions: {
    },
    reducers: {
        triggerCollapse(state, {type, payload}){
            return {
                ...state,
                ...payload
            }
        }
    }
}
