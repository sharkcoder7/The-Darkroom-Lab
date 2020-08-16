import {createAction, createReducer} from "redux-act";

export const setToken = createAction('Set user token');
export const setTheme = createAction('Set theme');
export const setAlbums = createAction('Set albums');
export const setSelectedAlbum = createAction('Set selected album');
export const setRolls = createAction('Set rolls');
export const setSelectedRoll = createAction('Set selected roll');
export const setSelectedImage = createAction('Set selected image');
export const setImagesLikes = createAction('Set images likes');

const initialState = {
    token: null,
    theme: 'dark',
    albums: [],
    selectedAlbum: null,
    rolls: [],
    selectedRoll: null,
    selectedImage: null,
    imagesLikes : {}
};

const main = createReducer({
    [setToken]: (state, payload) => ({...state, token: payload}),
    [setTheme]: (state, payload) => ({...state, theme: payload}),
    [setAlbums]: (state, payload) => ({...state, albums: payload}),
    [setSelectedAlbum]: (state, payload) => ({...state, selectedAlbum: payload}),
    [setRolls]: (state, payload) => ({...state, rolls: payload}),
    [setSelectedRoll]: (state, payload) => ({...state, selectedRoll: payload}),
    [setSelectedImage]: (state, payload) => ({...state, selectedImage: payload}),
    [setImagesLikes]: (state, payload) => ({...state, imagesLikes: payload}),
}, initialState);

export default main;
