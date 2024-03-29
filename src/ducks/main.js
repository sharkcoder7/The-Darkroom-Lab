import {createAction, createReducer} from "redux-act";

export const setToken = createAction('Set user token');
export const setTheme = createAction('Set theme');
export const setAlbums = createAction('Set albums');
export const setSelectedAlbum = createAction('Set selected album');
export const setRolls = createAction('Set rolls');
export const setSelectedRoll = createAction('Set selected roll');
export const setSelectedImage = createAction('Set selected image');
export const setImagesLikes = createAction('Set images likes');
export const setImagesRotation = createAction('Set images rotation');
export const setImagesTooltipProcessed = createAction('Set image tooltip processed');
export const setFcmToken = createAction('Set Firebase Messaging Token');
export const setUncheckedNotificationsCount = createAction('Set unchecked notifications count');
export const setOrientation = createAction('Set orientation');
export const setForceAlbumId = createAction('Set force album id');
export const setForceRollId = createAction('Set force roll id');

const initialState = {
    token: null,
    theme: 'dark',
    albums: [],
    selectedAlbum: null,
    rolls: [],
    selectedRoll: null,
    selectedImage: null,
    imagesLikes : {},
    imagesRotation : {},
    imagesTooltipProcessed : false,
    fcmToken : '',
    uncheckedNotificationsCount : 0,
    orientation : null,
    forceAlbumId : null,
    forceRollId : null
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
    [setImagesRotation]: (state, payload) => ({...state, imagesRotation: payload}),
    [setImagesTooltipProcessed]: (state, payload) => ({...state, imagesTooltipProcessed: payload}),
    [setFcmToken]: (state, payload) => ({...state, fcmToken: payload}),
    [setUncheckedNotificationsCount]: (state, payload) => ({...state, uncheckedNotificationsCount: payload}),
    [setOrientation]: (state, payload) => ({...state, orientation: payload}),
    [setForceAlbumId]: (state, payload) => ({...state, forceAlbumId: payload}),
    [setForceRollId]: (state, payload) => ({...state, forceRollId: payload}),
}, initialState);

export default main;
