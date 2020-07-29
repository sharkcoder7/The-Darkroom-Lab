import {persistReducer, persistStore} from "redux-persist";
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import main, {setTest} from "./ducks/main";
import FastStorage from "react-native-fast-storage";

const development = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
export let persistorLink;

export function configureStore ()
{
    const middlewares = [];
    if (development)
    {
        const {logger} = require(`redux-logger`);
        middlewares.push(logger);
    }

    const withStorage = true;

    const rootReducer = combineReducers({
        main : withStorage ? persistReducer({key: "main", storage : FastStorage, blacklist: []}, main) : main
    });
    const enhancer = compose(applyMiddleware(...middlewares));
    const store = createStore(rootReducer, enhancer);
    const persistor = persistStore(store);
    persistorLink = persistor;

    assignActionsCreators(store);

    return {store, persistor};
}

function assignActionsCreators (store) {
    setTest.assignTo(store);
}
