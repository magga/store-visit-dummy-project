const initialState = {
    current: null
};

export default function reducers(state = initialState, action) {
    switch (action.type) {
        case 'FETCH_CUSTOMER_STORE_VISIT':
            return { ...state, current: action.payload };
        default:
            return state;
    }
}
