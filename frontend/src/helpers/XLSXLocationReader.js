import { read, utils } from 'xlsx';
import axios from 'axios';
import XMLParser from 'react-xml-parser';
import { MAPAPI, APIKEY } from '../config';

class XLSXLocationReader {
    static async Read(arrayBuffer, callback) {
        let wb = read(arrayBuffer, { type: 'binary' });
        let liftSheetName = "Lift Location";
        let inspectorSheetName = "Inspectors";
        if (wb.SheetNames.indexOf(liftSheetName) === -1 || wb.SheetNames.indexOf(inspectorSheetName) === -1) {
            return false;
        }
        let lifts = utils.sheet_to_json(wb.Sheets[liftSheetName]);
        let jobs = [];
        let vehicles = [];

        let jobCt = 0;
        let vehicleCt = 0;
        let callbacks = (e, ind) => {
            if (e == "job") jobCt++;
            if (e == "vehicle") vehicleCt++;
            if (jobCt === lifts.length && vehicleCt === inspectors.length) callback({ "jobs": jobs, "vehicles": vehicles, "options": { "g": true }, "shipments": [] });
        }
        for (let i = 0; i < lifts.length; i++) {
            try {
                let data = {};
                jobs.push(data);
                XLSXLocationReader.getJobData(lifts[i], i + 1, data, (e) => {
                    callbacks("job", i);
                });
            }
            catch (err) {
                console.error(err);
            }
        }
        let inspectors = utils.sheet_to_json(wb.Sheets[inspectorSheetName]);
        for (let i = 0; i < inspectors.length; i++) {
            try {
                let data = {};
                vehicles.push(data);
                XLSXLocationReader.getVehicleData(inspectors[i], i + 1, data, (e) => {
                    callbacks("vehicle", i);
                });
            }
            catch (err) {
                console.error(err);
            }
        }
        return { "jobs": jobs, "vehicles": vehicles, "options": { "g": true }, "shipments": [] };
    }

    static async getJobData(lift, ind, data, callback) {
        data.description = lift.Address;
        data.id = ind;
        data.delivery = [1];
        data.skills = [1];
        data.location = await XLSXLocationReader.getLatLngWithAddress(lift.Address + ", " + lift.Location + " - " + lift["Postal Code"] + ", Portugal");
        callback();
        return data;
    }

    static async getVehicleData(inspector, ind, data, callback) {
        let loc = await XLSXLocationReader.getLatLngWithAddress(inspector.Address + ", " + inspector.Localidade + ", " + inspector.CodigoPostal + ", Portugal");
        data.start = loc;
        data.end = loc;
        data.description = inspector["Inspector Name"];
        data.id = ind;
        data.capacity = [6];
        data.skills = [1, 5];
        callback();
        return data;
    }

    static async getLatLngWithAddress(address) {
        let config = {
            method: 'post',
            url: MAPAPI + "geocode/xml?key=" + APIKEY + "&sensor=false&address=" + address,
            headers: {
                'Content-Type': 'application/json'
            },
        };
        const res = await axios(config);
        try {
            let psDt = (new XMLParser()).parseFromString(res.data).getElementsByTagName("result")[0].getElementsByTagName("geometry")[0].getElementsByTagName("location")[0];
            return [parseFloat(psDt.children[1].value), parseFloat(psDt.children[0].value)];
        }
        catch (err) {
            console.log(address);
            return null;
        }

    }
}

export default XLSXLocationReader;