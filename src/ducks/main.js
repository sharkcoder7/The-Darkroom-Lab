import {createAction, createReducer} from "redux-act";

export const setTest = createAction('gogo test');
const initialState =  {test : '12312312'};

const main = createReducer({
    [setTest]: (state, payload) => ({...state, test: payload})
}, initialState);

export default main;