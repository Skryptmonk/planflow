import { read, utils } from 'xlsx';
import axios from 'axios';
import XMLParser from 'react-xml-parser';
import { MAPAPI, APIKEY } from '../config';

class ExcelToJson {

    static async Read(arrayBuffer, callback) {
        let wb = read(arrayBuffer, { type: 'binary' });
        let liftSheetName = "Inspection List";
        let inspectorSheetName = "Inspector";
        if (wb.SheetNames.indexOf(liftSheetName) === -1 || wb.SheetNames.indexOf(inspectorSheetName) === -1) {
            return false;
        }
        let lifts = utils.sheet_to_json(wb.Sheets[liftSheetName]);
        let inspectors = utils.sheet_to_json(wb.Sheets[inspectorSheetName]);
        let Inspections = [];
        let Inspectors = [];

        let jobCt = 0;
        let vehicleCt = 0;
        let callbacks = (e, ind) => {
            if (e == "Inspections") jobCt++;
            if (e == "Inspectors") vehicleCt++;
            if (jobCt === lifts.length && vehicleCt === inspectors.length) callback({ "Inspections": Inspections, "Inspectors": Inspectors });
        }
        for (let i = 0; i < lifts.length; i++) {
            try {
                let data = {};
                Inspections.push(data);
                ExcelToJson.getJobData(lifts[i], i + 1, data, (e) => {
                    callbacks("Inspections", i);
                });
            }
            catch (err) {
                console.error(err);
            }
        }

        for (let i = 0; i < inspectors.length; i++) {
            try {
                let data = {};
                Inspectors.push(data);
                ExcelToJson.getVehicleData(inspectors[i], i + 1, data, (e) => {
                    callbacks("Inspectors", i);
                });
            }
            catch (err) {
                console.error(err);
            }
        }
        return { "Inspections": Inspections, "Inspectors": Inspectors };
    }


    static async getJobData(lift, ind, data, callback) {
        const getFormatedTime = (numericValue) => {
            const excelEpochDiff = 25569;
            const millisecondsPerDay = 24 * 60 * 60 * 1000
            const unixEpochMillis = (numericValue - excelEpochDiff) * millisecondsPerDay;
            const date = new Date(unixEpochMillis);
            const formattedDate = date.toISOString();
            return formattedDate
        }
        const ScheduleDate = getFormatedTime(lift.ScheduleDate)
        const StartTime = getFormatedTime(lift.StartTime)
        const EndTime = getFormatedTime(lift.EndTime)
        data.ScheduleId = lift['ScheduleId'];
        data.InspectionCode = lift['InspectionCode']
        data.InspectorId = lift['InspectorId']
        data.StartTime = StartTime
        data.EndTime = EndTime
        data.ContactName = lift['ContactName']
        data.ContactNumber = lift['ContactNumber']
        data.ScheduleDate = ScheduleDate
        data.ObjectName = lift['ObjectName']
        data.Address = lift.Address;
        data.DoorNo = lift.DoorNo
        data.Floor = lift['Floor']
        data.Block = lift['Block']
        data.Location = lift.Location
        data.PostalCode = lift['PostalCode']
        data.Region = lift.Region
        data.Country = lift.Country
        data.MetaData = lift['MetaData']
        // data.location = await ExcelToJson.getLatLngWithAddress(lift.Address + ", " + lift.Location + " - " + lift["Postal Code"] + ", Portugal");
        callback();
        return data;
    }

    static async getVehicleData(inspector, ind, data, callback) {
        // let loc = await ExcelToJson.getLatLngWithAddress(inspector.Address + ", " + inspector.Localidade + ", " + inspector.CodigoPostal + ", Portugal");
        // data.start = loc;
        // data.end = loc;
        data.InspectorName = inspector["InspectorName"];
        data.Address = inspector['Address']
        data.Location = inspector['Location']
        data.PostalCode = inspector['PostalCode']
        data.Country = inspector['Country']
        data.InspectorId = inspector['InspectorId'];
        data.GeometryData = inspector['GeometryData']
        data.MetaData = inspector['MetaData']
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

export default ExcelToJson;