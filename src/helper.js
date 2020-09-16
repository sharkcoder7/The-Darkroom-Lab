import {useCallback, useState} from "react";
import {shallowEqual, useSelector} from 'react-redux';
import {setAlbums, setRolls, setSelectedAlbum, setSelectedRoll} from './ducks/main';
import Bugsnag from '@bugsnag/react-native'

export const API_ENDPOINT = 'https://thedarkroom.com/api/api/v1';

export function useRequest ()
{
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = useSelector(state => state.main.token, shallowEqual);

    const request = useCallback( async (endpoint, options = {}, additionalHeaders = {}, returnFullResponse = false) => {

        setLoading(true);

        if (options.withAuth !== false)
        {
            additionalHeaders['Authorization'] = 'Bearer ' + token;
        }

        const headers = new Headers({'Content-Type' : 'application/json', ...additionalHeaders});
        options = {...options, mode: 'cors', timeout : options.timeout || 5000, headers};
        let response = await timeoutPromise(options.timeout, fetch((!endpoint.match('http') ? API_ENDPOINT : '') + endpoint, options));

        try
        {
            if (!response.ok)
            {
                throw new Error('Something went wrong. Please contact us.');
            }

            let result;
            try
            {
                result = await response.json();
            }
            catch (e)
            {
                Bugsnag.notify(e);
                throw new Error('Incorrect server response (json error)');
            }

            if (!result.success)
            {
                throw new Error(result.message);
            }

            return returnFullResponse ? result : result.data;
        }
        catch (e)
        {
            Bugsnag.notify(e);
            setError(e.message);
            throw e.message;
        }
        finally
        {
            setLoading(false);
        }
    }, []);

    return { loading, request, error }
}

function timeoutPromise (ms, promise)
{
    return new Promise((resolve, reject) =>
    {
        const timeoutId = setTimeout(() =>
        {
            reject(new Error("Timeout error"))
        }, ms);
        promise.then(
            (res) =>
            {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) =>
            {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    })
}

export function mobilecheck ()
{
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}



export function throttle (func, ms)
{
    var freezed = false,
        savedArgs,
        savedThis;

    function wrapper ()
    {
        if (freezed)
        {
            savedArgs = arguments;
            savedThis = this;
        }
        else
        {
            func.apply(this, arguments);
            freezed = true;

            setTimeout(() =>
            {
                freezed = false;
                if (savedArgs)
                {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }
    }

    return wrapper;
}

export function checkChanges (currentProps, currentState, nextProps, nextState)
{
    let changes = {};
    for (let key in nextProps)
    {
        if (!nextProps.hasOwnProperty(key))
        {
            continue;
        }

        if (currentProps[key] !== nextProps[key])
        {
            changes[key] = [currentProps[key], nextProps[key]];
        }
    }

    for (let key in nextState)
    {
        if (!nextState.hasOwnProperty(key))
        {
            continue;
        }

        if (currentState[key] !== nextState[key])
        {
            changes[key] = [currentState[key], nextState[key]];
        }
    }

    return changes;
}

export function useUpdater ()
{
    const albums = useSelector(state => state.main.albums, shallowEqual);
    const selectedAlbum = useSelector(state => state.main.selectedAlbum, shallowEqual);
    const rolls = useSelector(state => state.main.rolls, shallowEqual);
    const selectedRoll = useSelector(state => state.main.selectedRoll, shallowEqual);

    function updateRoll (idRoll, updates)
    {
        const originalRoll = rolls.find(existingRoll => existingRoll.id === idRoll);
        if (originalRoll === undefined)
        {
            return;
        }

        const updatedRoll = Object.assign(originalRoll, updates),
              updatedRolls = rolls.map(existingRoll => existingRoll.id === idRoll ? updatedRoll : existingRoll),
              updatedAlbum = {...selectedRoll, rolls : updatedRolls};

        setRolls(updatedRolls);
        if (selectedRoll !== null && selectedRoll.id === idRoll)
        {
            setSelectedRoll(updatedRoll);
        }

        setSelectedAlbum(updatedAlbum);

    }

    function updateAlbum (idAlbum, updates)
    {
        const originalAlbum = albums.find(existingAlbum => existingAlbum.id === idAlbum);
        if (originalAlbum === undefined)
        {
            return;
        }

        const updatedAlbum = {...originalAlbum, ...updates},
              updatedAlbums = albums.map(existingAlbum => existingAlbum.id === idAlbum ? updatedAlbum : existingAlbum);

        setAlbums(updatedAlbums);
        if (selectedAlbum !== null && selectedAlbum.id === idAlbum)
        {
            setSelectedAlbum(updatedAlbum);
        }
    }


    return { updateAlbum, updateRoll }
}

