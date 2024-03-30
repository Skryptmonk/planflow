import { GETROUTEDATA, MAINSCREENLOADING, GETROUTEDATA_ERROR } from './mainscreenType';

const initialState = {
    data: 1
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GETROUTEDATA:
            return {
                ...state,
                mainData: action.payload,
                loading: false,
                error: null
            };
        case MAINSCREENLOADING:
            return {
                ...state,
                error: null,
                loading: true
            };
        case GETROUTEDATA_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false
            }
        default: return state;
    }
}