import {createAction, createReducer} from "redux-act";

export const setToken = createAction('Set user token');
const initialState =  {token : null};

const main = createReducer({
    [setToken]: (state, payload) => ({...state, token: payload})
}, initialState);

export default main;
