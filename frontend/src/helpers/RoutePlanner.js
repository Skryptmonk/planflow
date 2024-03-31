import axios from "axios";
import { APIKEY, APIURL, MAPAPI } from "../config";
import latlongDecoder from "./latlongDecoder";
import Cookies from "js-cookie";
import db from "../indexedDB";
import { VROOMAPI, CROSS_DOMAIN_URL } from "../config";

export default class RoutePlanner {
  static #is_loaded = false;
  static #has_optimized = false;
  static #input_data = {};
  static #selected_date = {};
  static #stats = {};
  static #allocated = [];
  static #excluded = { inspections: [], inspectors: [] };
  static #unallocated = { inspections: [], inspectors: [], invalid: [] };
  static #optimized = {};
  static toastMessageFunction;


  static get is_loaded() {
    return RoutePlanner.#is_loaded;
  }

  static get input_data() {
    return RoutePlanner.#input_data;
  }

  static get optimized() {
    return RoutePlanner.#optimized;
  }


  static get selected_date() {
    return RoutePlanner.#selected_date;
  }

  static get stats() {
    return RoutePlanner.#stats;
  }

  static get allocated() {
    return RoutePlanner.#allocated;
  }

  static get unallocated() {
    return RoutePlanner.#unallocated;
  }

  static get excluded() {
    return RoutePlanner.#excluded;
  }

  static get hasOptimized() {
    return RoutePlanner.#has_optimized;
  }

  static LoadInputFromJson(date, inputData) {
    RoutePlanner.#clearAll();
    RoutePlanner.#selected_date = date;
    RoutePlanner.#input_data = { ...inputData };
    RoutePlanner.#optimized = JSON.parse(JSON.stringify(inputData));
  }

  static SetDate(date) {
    RoutePlanner.#clearAll();
    RoutePlanner.#selected_date = date;
  }

  static async LoadDataFromAPI(date, url, token) {
    try {
      RoutePlanner.#clearAll();
      let actUrl = url + "&" + RoutePlanner.#convertDateToQueryString(date);
      let config = {
        method: "GET",
        url: actUrl,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin':'*',
          Authorization: token,
        },
      };
      const res = await axios(config);
      let data = res.data.GetRouteOptimizationInspectionListResult[0];
      RoutePlanner.#has_optimized =
        data.Inspectors.filter((e) => e.GeometryData !== "").length > 0;
      RoutePlanner.#input_data = data;
      RoutePlanner.#optimized = data;
      RoutePlanner.#selected_date = date;
      if (RoutePlanner.#has_optimized) {
        RoutePlanner.#unallocated.inspections = data.Inspections.filter(inspection => !inspection.MetaData);
        let routes = data.Inspectors.map(inspector => {
          let metaData = !inspector.MetaData ? {} : JSON.parse(inspector.MetaData);
          let location = metaData.location;
          if (location) inspector.latLng = { lat: location[1], lng: location[0] };

          let steps = data.Inspections.filter(inspection => inspection.InspectorId === inspector.InspectorId && inspection.MetaData).map(inspection => {
            let stMetatdata = inspection.MetaData ? JSON.parse(inspection.MetaData) : { location: [0, 1] };
            inspection.latLng = { lat: stMetatdata.location[1], lng: stMetatdata.location[0] };
            let step = {
              type: "job",
              description: JSON.stringify({ ...inspection }),
              id: inspection.ScheduleId,
              job: inspection.ScheduleId,
              location: stMetatdata.location,
              distance: stMetatdata.distance,
              duration: stMetatdata.duration,
              service: stMetatdata.service,
              arrival: stMetatdata.arrival
            };
            return step;
          });
          steps.sort((a, b) => a.arrival - b.arrival);
          let startStepDetails = {
            location: location,
            arrival: 0,
            load: [steps.length]
          }
          let endStepDetails = {
            location: metaData.location,
            load: [steps.length],
            distance: metaData.distance,
            duration: metaData.duration,
            service: metaData.service,
            arrival: metaData.duration + metaData.service
          }
          steps.unshift({ ...startStepDetails, type: "start" });
          steps.push({ ...endStepDetails, type: "end" });
          let vehicle = {
            vehicle: inspector.InspectorId,
            color: RoutePlanner.getRandomColor(),
            delivery: [steps.length - 2],
            service: metaData.service,
            setup: metaData.setup,
            distance: metaData.distance,
            duration: metaData.duration,
            cost: metaData.cost,
            arrival: metaData.arrival,
            latLng: latlongDecoder(inspector.GeometryData).map((lt) => ({
              lat: lt[0],
              lng: lt[1],
            })),
            geometry: inspector.GeometryData,
            description: JSON.stringify({ ...inspector, GeometryData: "" }),
            steps: steps
          };
          return vehicle;
        });
        RoutePlanner.#allocated = routes.filter(e => e.steps.length > 2);
        console.log(RoutePlanner.#allocated);
        routes.filter(e => e.steps.length <= 2).forEach(rt => {
          RoutePlanner.#addUnallocatedInspector(rt.vehicle)
        });
        RoutePlanner.#computeStats(RoutePlanner.#allocated, RoutePlanner.#allocated);
      }
      return data;
    } catch (err) {
      console.log("The error is:", err);
    }
  }

  static #computeStats(allocatedData, consolidatedData) {
    var totalAllocatedInspections = 0;
    allocatedData.forEach((e) => {
      const val = e.delivery[0];
      totalAllocatedInspections += val;
    });

    var totalHours = allocatedData.length * 8 * 60;

    var totalDistance = 0;
    var totalSetup = 0;
    var totalService = 0;
    var totalDuration = 0;

    consolidatedData.forEach((e) => {
      const durVal = e.duration;
      totalDuration += durVal;
      const disVal = e.distance;
      totalDistance += disVal;
      const serVal = e.service;
      totalService += serVal;
      const setVal = e.setup;
      totalSetup += setVal;
    });
    var totalTimeInvolved = Math.floor(
      (totalDuration + totalService) / 60
    );
    var availability = (totalHours / totalTimeInvolved) * 100;
    const computedStats = {
      allocatedInspections: totalAllocatedInspections,
      unallocatedInspections: RoutePlanner.unallocated.inspections.length,
      totalDuration: totalDuration,
      totalDistance: totalDistance,
      totalService: totalService,
      totalSetup: totalSetup,
      totalTimeInvolved: totalTimeInvolved,
      availability: availability,
    };
    RoutePlanner.#stats = computedStats;
  };

  static ExcludeInspector(inspectorID) {
    let index = RoutePlanner.#allocated.findIndex(
      (e) => e.vehicle === inspectorID
    );
    let inspector = RoutePlanner.#allocated[index];
    RoutePlanner.#allocated.splice(index, 1);
    inspector.steps.filter(
      (e) => e.type !== "start" && e.type !== "end"
    ).map(e => RoutePlanner.#addUnallocatedInspection(e.job));
    RoutePlanner.#excludeInspectors(inspectorID);

  }

  static AddFromExcludeInspectors(inspectorId) {
    let inspector = RoutePlanner.#optimized.Inspectors.filter(
      (e) => e.InspectorId === inspectorId
    )[0];
    if (!(RoutePlanner.#unallocated.inspectors.includes(inspector)) && !(RoutePlanner.#unallocated.inspectors.includes(inspector))) {
      RoutePlanner.#input_data.Inspectors.push(inspector);
    }

    RoutePlanner.#addUnallocatedInspector(inspectorId);
    RoutePlanner.excluded.inspectors.forEach((e, i) => {
      if (e.InspectorId === inspectorId) {
        RoutePlanner.excluded.inspectors.splice(i, 1);
      }
    })
  }

  static async RemoveInspection(inspectorID, inspectionID, config, isExcluded = false) {
    let index = RoutePlanner.#allocated.findIndex(
      (e) => e.vehicle === inspectorID
    );
    if (index === -1) return false;
    let inspector = RoutePlanner.#allocated[index];
    let newJobs = inspector.steps.filter(
      (e) => e.job !== inspectionID && e.type !== "start" && e.type !== "end"
    );
    let jobs = newJobs.map((e) => {
      return {
        description: e.description,
        id: e.job,
        delivery: [1],
        skills: [1],
        location: e.location,
        service: e.service,
      };
    });
    let vehicle = {
      description: inspector.description,
      id: inspector.vehicle,
      capacity: [config.max_inspection_count],
      skills: [1, 5],
      start: inspector.steps[0].location,
      end: inspector.steps[0].location,
      time_window: [0, config.time * 60 * 60],
    };
    RoutePlanner.#addUnallocatedInspection(inspectionID);
    if (jobs.length === 0) {
      if (isExcluded) {
        RoutePlanner.#excludeInspectors(inspectorID);
      } else {
        RoutePlanner.#addUnallocatedInspector(inspectorID);
      }
      RoutePlanner.#allocated.splice(index, 1);
      return true;
    }
    let data = {
      jobs: jobs,
      vehicles: [vehicle],
      options: { g: true },
      shipments: [],
    };
    let input = {
      method: "post",
      url: APIURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };
    const res = await axios(input);
    let resData = res.data?.routes ?? false;
    if (!resData) return {};
    if (inspector != null) resData[0].color = inspector.color
    resData = RoutePlanner.#attachExtras(resData);
    RoutePlanner.#allocated[index] = resData[0];
  }

  static async AddInspection(inspectorID, inspectionID, config) {
    let index = RoutePlanner.#allocated.findIndex(
      (e) => e.vehicle === inspectorID
    );
    let inspector = {};
    let newJobs = [];
    let vehicle = {};
    if (index === -1) {
      index = RoutePlanner.#unallocated.inspectors.findIndex(
        (e) => e.InspectorId === inspectorID
      );
      if (index === -1) return false;
      inspector = RoutePlanner.#unallocated.inspectors[index];
      vehicle = {
        description: JSON.stringify(inspector),
        id: inspector.InspectorId,
        capacity: [config.max_inspection_count],
        skills: [1, 5],
        start: [inspector.latLng.lng, inspector.latLng.lat],
        end: [inspector.latLng.lng, inspector.latLng.lat],
        time_window: [0, config.time * 60 * 60],
      };
      index = -1;
    } else {
      inspector = RoutePlanner.#allocated[index];
      newJobs = inspector.steps.filter(
        (e) => e.type !== "start" && e.type !== "end"
      );
      vehicle = {
        description: inspector.description,
        id: inspector.vehicle,
        capacity: [newJobs.length + 1],
        skills: [1, 5],
        start: inspector.steps[0].location,
        end: inspector.steps[0].location,
        time_window: [0, config.time * 60 * 60],
      };
    }
    let jobs = newJobs.map((e) => {
      return {
        description: e.description,
        id: e.job,
        delivery: [1],
        skills: [1],
        location: e.location,
        service: e.service,
      };
    });
    let insIndex = RoutePlanner.#input_data.Inspections.findIndex(
      (e) => e.ScheduleId === inspectionID
    );
    let inspection = RoutePlanner.#input_data.Inspections[insIndex];
    jobs.push({
      description: JSON.stringify(inspection),
      id: inspection.ScheduleId,
      delivery: [1],
      skills: [1],
      location: [inspection.latLng.lng, inspection.latLng.lat],
      service: config.avgInsTime * 60,
    });
    let data = {
      jobs: jobs,
      vehicles: [vehicle],
      options: { g: true },
      shipments: [],
    };
    let input = {
      method: "post",
      url: APIURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };
    const res = await axios(input);
    let resData = res?.data?.routes ?? {};
    if (Object.keys(resData).length == 0) {
      return false;
    }
    if (!resData || resData[0].steps.length - 2 !== jobs.length) return false;
    if (inspector != null) resData[0].color = inspector.color
    resData = RoutePlanner.#attachExtras(resData);
    if (index === -1 && resData[0]) RoutePlanner.#allocated.push(resData[0]);
    else RoutePlanner.#allocated[index] = resData[0];
    if (resData.length > 0) {
      RoutePlanner.#unallocated.inspections =
        RoutePlanner.#unallocated.inspections.filter(
          (e) => e.ScheduleId !== inspectionID
        );

      index = RoutePlanner.#unallocated.inspectors.findIndex(
        (e) => e.InspectorId === inspectorID
      );
      if (index !== -1)
        RoutePlanner.#unallocated.inspectors =
          RoutePlanner.#unallocated.inspectors.filter(
            (e) => e.InspectorId !== inspectorID
          );
      return true;
    } else {
      return false;

    }
  }

  static async Publish(date, url, params) {
    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    var endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    let allocatedValue = RoutePlanner.#allocated.map((e) => {
      let inspections = e.steps.filter(step => step.type === "job").map((s) => {
        return {
          ScheduleId: s.id,
          StartTime: "/Date(" + date.getTime() + ")/",
          EndTime: "/Date(" + date.getTime() + ")/",
          MetaData: JSON.stringify({
            location: s.location,
            distance: s.distance,
            duration: s.duration,
            service: s.service,
            arrival: s.arrival
          }),
        };
      });
      let startEndTime = e.steps.filter(step => step.type !== "job").map(e => e.arrival);
      let inspector = {
        InspectorId: e.vehicle,
        ScheduleDate: "/Date(" + date.getTime() + ")/",
        GeometryData: e.geometry,
        MetaData: JSON.stringify({
          arrival: e.arrival,
          start_end: startEndTime,
          location: e.steps[0].location,
          cost: e.cost,
          color: e.color,
          distance: e.distance,
          duration: e.duration,
          service: e.service,
          setup: e.setup,
        }),
        Inspections: inspections,
      };
      return inspector;
    });
    allocatedValue.map(async(inspector)=>{
      let reqData = {
        "clientId": params.clientId,
        "languageId": params.languageId,
        "verticalId": params.verticalId,
        "userId": params.userId,
        "lstOptimizedData": [inspector]
      };
      let config = {
        method: "POST",
        url: url,
        headers: {
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin':'*',
          Authorization: params.authentication,
        },
        data: reqData
      };
      const response = await axios(config);
      let result = response.data['SaveRouteOptimizationDetailsResult'].Success;
      if(result){
        RoutePlanner.toastMessageFunction(`Published Successfully`,true);
      }else{
        RoutePlanner.toastMessageFunction(`Inspector Id ${inspector.InspectorId} data cannot be published`,true);
      }
      
    })
  }

  static async #addUnallocatedInspector(inspectorID) {
    let inspector = [];
    inspector = RoutePlanner.#optimized.Inspectors.filter(
      (e) => e.InspectorId === inspectorID
    )[0];
    if (!inspector.color) inspector.color = "#F23333"
    if (!inspector.latLng) {
      inspector = await RoutePlanner.#appendLatLngAddToInspection(await RoutePlanner.#appendLatLngAdd(inspector));
    }
    RoutePlanner.#unallocated.inspectors.push(inspector);
    //Adding inspectors removed inspectors from the input to optimize route. 
    if (!RoutePlanner.#input_data.Inspectors.includes(inspector) && !(RoutePlanner.#unallocated.inspectors.includes(inspector))) {
      RoutePlanner.input_data.Inspectors.push(inspector);
    }

  }

  static #excludeInspectors(inspectorId) {
    let inspector = [];
    inspector = RoutePlanner.#input_data.Inspectors.filter(
      (e) => e.InspectorId === inspectorId
    )[0];
    RoutePlanner.#excluded.inspectors.push(inspector);
    //Removing the inspector when inspector is moved to excluded.
    RoutePlanner.excluded.inspectors.forEach((e, i) => {
      RoutePlanner.#input_data.Inspectors.forEach((f, j) => {
        if (f.InspectorId === e.InspectorId) {
          RoutePlanner.input_data.Inspectors.splice(j, 1);
        }
      })
    })
  }

  static #addUnallocatedInspection(inspectionID) {
    let inspection = [];
    inspection = RoutePlanner.#input_data.Inspections.filter(
      (e) => e.ScheduleId === inspectionID
    )[0];
    RoutePlanner.#unallocated.inspections.push(inspection);
  }

  static async #sendDataToDB(address, dataToSend) {
    // Add the calculated address to db.

    let obj = { latitude: dataToSend.lat, longitude: dataToSend.lng, address: address, isValid: true };
    let saveObject = {
      "Url": `${window.urlParamString}/SaveGeoCoordinates`,
      "Body": obj,
      "Method": "Post"
    }
    try {
      const response = await fetch(`${VROOMAPI}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin':'*'
        },
        body: JSON.stringify(saveObject),
      });

      if (!response.ok) {
        console.error('Failed to send data:', response.statusText);
      } else {
        console.log('Data sent successfully!');
      }
    } catch (error) {
      console.error('Error sending data', error);
    }
  };



  static async #getLanLngAdd(data,toastFunction) {


    try {
      //Checks if address is in indexed DB
      const local = await db.coordinates.where('address').equals(data).first() || "{}";
      //To avoid duplicate API calls, we get latLng from indexed DB that we maintained previously
      if (local.latLong && local.latLong.lat && local.latLong.lng) {
        return { lat: parseFloat(local.latLong.lat), lng: parseFloat(local.latLong.lng) };
      }

      let config = {
        method: "post",
        url:
          MAPAPI + "geocode/json?key=" + APIKEY + "&sensor=false&address=" + data,
        headers: {
          "Content-Type": "application/json",
        },
      };
      const res = await axios(config);
      const latLng = res.data.results[0]?.geometry.location ?? null;
      const results = res.data.results;

      if (latLng) {
        for (var i = 0; i < results[0].address_components.length; i++) {
          var component = results[0].address_components[i];
          if (component.types.includes('country') && component.long_name === 'Portugal') {
            db.coordinates.add({ address: data, latLong: latLng });
            await RoutePlanner.#sendDataToDB(data, latLng)
            return latLng;
          }   
      }
      RoutePlanner.toastMessageFunction(`Inspector address ${results[0].formatted_address} is outside Portugal`,true)
      }
      return latLng;
    } catch (e) {
      console.error('Error retriving address:', this.excluded);
    }
  }

  static async #appendLatLngAdd(data) {
    let latLng = await RoutePlanner.#getLanLngAdd(
      data.Address +
      ", " +
      data.Location +
      " - " +
      data.PostalCode +
      ", " +
      data.Country
    );
    data.latLng = latLng;
    return data;
  }

  static async #appendLatLngAddToInspection(data) {
    let latLng = await RoutePlanner.#getLanLngAdd(
      data.Address +
      ", " +
      data.Location +
      " - " +
      data.PostalCode +
      ", " +
      data.Country
    );
    data.latLng = latLng;
    return data;
  }

  static async computeStatsAfterChange() {
    this.#computeStats(RoutePlanner.allocated, RoutePlanner.allocated);
  }

  static async Compute(config,toastFunction) {
    RoutePlanner.toastMessageFunction = toastFunction
    try {
      RoutePlanner.excluded.inspectors.forEach((e, i) => {
        RoutePlanner.#input_data.Inspectors.forEach((f, j) => {
          if (f.InspectorId === e.InspectorId) {
            RoutePlanner.input_data.Inspectors.splice(j, 1);
          }
        })
      })

      const jobsDt = [];

      //To avoid parallel api fetch we changed Promise.all to for-loop
      for (const e of RoutePlanner.#input_data.Inspections) {
        if (await RoutePlanner.#isValidAddress(e.Address + ", " + e.Location + " - " + e.PostalCode + ", " + e.Country)) {
          jobsDt.push(await RoutePlanner.#appendLatLngAdd(e));
        } else {
          if (!RoutePlanner.unallocated.invalid?.includes(e)) RoutePlanner.unallocated.invalid.push(e);
        }
      }

      let jobs = jobsDt.map((e) => {
        if (e) {
          return {
            description: JSON.stringify(e),
            id: e.ScheduleId,
            contactNumber: e.ContactNumber,
            contactName: e.ContactName,
            delivery: [1],
            skills: [1],
            location: [e.latLng.lng, e.latLng.lat],
            service: config.avgInsTime * 60,
            Address: e.Address,
            floor: e.Floor,
            doorNo: e.DoorNo,
            startTime: e.StartTime,
            endTime: e.EndTime,
            ScheduleDate: e.ScheduleDate,
            block: e.Block,
            country: e.Country,
            region: e.Region,
            place: e.Location,
            metaData: e.MetaData
          };
        }
      });

      const vehicleDt = [];
      //To avoid parallel api fetch we changed Promise.all to for-loop
       for (const e of RoutePlanner.#input_data.Inspectors) {
          const result = await RoutePlanner.#appendLatLngAddToInspection(e);
          vehicleDt.push(result);
   
     }

      let vehicles = vehicleDt.map((e) => {
        return {
          description: JSON.stringify(e),
          id: e.InspectorId,
          capacity: [config.max_inspection_count],
          skills: [1, 5],
          start: [e.latLng.lng, e.latLng.lat],
          end: [e.latLng.lng, e.latLng.lat],
          time_window: [0, config.time * 60 * 60],
          address: e.Address,
          name: e.InspectorName,
          location: e.Location,
          postalCode: e.PostalCode,
          country: e.Country,
          geomentry: e.GeometryData,
          metaData: e.MetaData,
        };
      });
      let data = {
        jobs: jobs.filter((e) => e != null),
        vehicles: vehicles,
        options: { g: true },
        shipments: [],
      };
      let input = {
        method: "post",
        url: APIURL,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      };
      const res = await axios(input);
      let resData = res.data?.routes ?? false;
      if (!resData) return {};
      resData = RoutePlanner.#attachExtras(resData);
      RoutePlanner.#unallocated.inspections.length = 0;
      RoutePlanner.#unallocated.inspectors.length = 0;
      RoutePlanner.#allocated = resData;
      res.data?.unassigned.forEach((e) => {
        if (e.type === "job") RoutePlanner.#addUnallocatedInspection(e.id);
        else RoutePlanner.#addUnallocatedInspector(e.id);
      });
      if (resData.length !== vehicles.length) {
        let allocatedID = resData.map((e) => e.vehicle);
        vehicles.forEach((vehicle) => {
          if (allocatedID.indexOf(vehicle.id) === -1)
            RoutePlanner.#addUnallocatedInspector(vehicle.id);
        });
      }
      RoutePlanner.#has_optimized = true;
      RoutePlanner.#computeStats(resData, res.data.routes);
    }catch(e){
      console.log(e);
    }
  }

  static #attachExtras(data) {
    data.forEach((inspector) => {
      if (!inspector.color) inspector.color = RoutePlanner.getRandomColor();
      inspector.latLng = latlongDecoder(inspector.geometry).map((lt) => ({
        lat: lt[0],
        lng: lt[1],
      }));
    });
    return data;
  }

  static shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  static colorsArray = [
    '#F90000', '#00A3FF', '#005A8C', '#1376BC', '#00068A',
    '#226F54', '#A71D31', '#6F7C12', '#483519', '#8F00FF',
    '#023888', '#83B102', '#3E006F', '#6F0078', '#92001A',
    '#BE5000', '#BC8803', '#02B414', '#00AE8F', '#0088A6',
    '#A1C181', '#619B8A', '#233D4D', '#3B2C35', '#C32F27',
  ];
  static usedColors = [];

  static getRandomColor() {
    const excludedColor = "#F23333";
    if (this.usedColors.length === this.colorsArray.length) {
      // If all colors have been used, reset the usedColors array
      this.usedColors = [];
    }
    let randomIndex;
    let randomColor;
    do {
      randomIndex = Math.floor(Math.random() * this.colorsArray.length);
      randomColor = this.shuffle(this.colorsArray)[randomIndex];
    } while (this.usedColors.includes(randomColor) || randomColor === excludedColor);

    this.usedColors.push(randomColor);
    return randomColor;
  }

  static #convertDateToQueryString(inputDate) {
    var nextDay = new Date(inputDate.getTime() + 86400000);
    var fromDate = inputDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    var toDate = nextDay.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    return "fromDate=" + fromDate + "&toDate=" + toDate;
  }

  static #clearAll() {
    RoutePlanner.#is_loaded = false;
    RoutePlanner.#input_data = {};
    RoutePlanner.#selected_date = {};
    RoutePlanner.#stats = {};
    RoutePlanner.#allocated = [];
    RoutePlanner.#unallocated = { inspections: [], inspectors: [], invalid: [] };
    RoutePlanner.#excluded = { inspections: [], inspectors: [] };
    RoutePlanner.#optimized = {};
  }

  static async #isValidAddress(address) {

    //Fetches the address if present in indexed db
    const local = await db.coordinates.where('address').equals(address).first() || "{}";
    //To avoid duplicate API calls, we get latLng from indexed db that we added previously
    if (local && local.latLong && local.latLong.lat && local.latLong.lng) {
      return true;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${APIKEY}`;
    try {
      const response = await axios.get(url);
      const results = response.data.results;
      if (results.length > 0) {
        // To avoid duplicate API calls, we maintain latLng in Cookies
        // Check whether the address is located in portugal or not
        for (var i = 0; i < results[0].address_components.length; i++) {

          var component = results[0].address_components[i];


          if (component.types.includes('country') && component.long_name === 'Portugal') {
            await db.coordinates.add({ address: address, latLong: results[0]?.geometry.location ?? null });
            return results.length > 0
          } 
      }
      RoutePlanner.toastMessageFunction(`Inspection ${results[0].formatted_address} is outside Portugal, Please Try with a address inside Portugal`,true)
      }
      RoutePlanner.toastMessageFunction("We couldn't Process your request now please try again after some time",true)
      return false
    } catch (error) {
      console.log('Error validating address:');
      return false;
    }
  }

}
