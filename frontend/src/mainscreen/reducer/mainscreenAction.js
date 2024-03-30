import { GETROUTEDATA, GETADDRESSDATA, MAINSCREENLOADING, GETROUTEDATA_ERROR } from './mainscreenType';
import axios from "axios";
import { APIURL, APIKEY, MAPAPI } from '../../config';
import LatLongDecoder from '../../helpers/latlongDecoder';
import RoutePlanner from '../../helpers/RoutePlanner';

export const getLatLngWithAddress = (data) => {
    return async (dispatch) => {
        try {
            setLoading(dispatch);
            let config = {
                method: 'post',
                url: MAPAPI + "geocode/xml?key=" + APIKEY + "&sensor=false&address=" + data,
                headers: {
                    'Content-Type': 'application/json'
                },
            };
            const res = await axios(config);
            dispatch({
                type: GETROUTEDATA,
                payload: res.data
            })
        }
        catch (err) {
            dispatch({
                type: GETROUTEDATA_ERROR,
                payload: err.message
            })
        }
    }
}

export const getRoutePath = (data) => {
    return async function (dispatch) {
        try {
            setLoading(dispatch);
            let config = {
                method: 'post',
                url: APIURL,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            };
            const res = await axios(config);
            res.data?.routes?.map(e => e.color = RoutePlanner.getRandomColor());
            res.data?.routes?.map(e => e.latLng = LatLongDecoder(e.geometry).map(lt => ({ lat: lt[0], lng: lt[1] })));
            dispatch({
                type: GETROUTEDATA,
                payload: res.data
            })
        }
        catch (err) {
            dispatch({
                type: GETROUTEDATA_ERROR,
                payload: err.message
            })
        }
    }
}

export const setLoading = (dispatch) => {
    dispatch({
        type: MAINSCREENLOADING
    })
}