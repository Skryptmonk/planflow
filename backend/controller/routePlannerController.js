require('dotenv').config()
const axios = require('axios');
const helper = require('../helpers/helper')
const nodeGeocoder = require('node-geocoder');
const reader  = require('xlsx');   
const xlsx = require('xlsx'); 
const path = require('path');
const redis = require('redis');
class routePlannerController {
  static welcome(req,res) {
    console.log("hii")
  }
  
  static getRoutePath = async(req,res) => {
  try {

    const file = reader.readFile('./inputFiles/Lift_Inspection_Address.xlsx');
  
    let data = []
    const sheets = file.SheetNames
    // let sheet1 = file.Sheets['sheet1'];
    const sheet1 = reader.utils.sheet_to_json(file.Sheets[file.SheetNames['0']]);
    const sheet2 = reader.utils.sheet_to_json(file.Sheets[file.SheetNames['1']]);
    let jobs = await this.JobDetails(sheet1);
    let inspector = await this.InspectorDetails(sheet2);  

    let inputData = {
      jobs : jobs,
      vehicles : inspector,
      options: {
        g: true
      },
      shipments: []
    }
    
    let config = {
      method: 'post',
      url: process.env.APIURL,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*'
      },
      data: JSON.stringify(inputData)
    };
    

    const result = await axios(config);
    console.log(result); 
    let color = result.data?.routes?.map(e => e.color = helper.getRandomColor());
    let latlong = result.data?.routes?.map(e => e.latLng = helper.LatLongDecoder(e.geometry).map(lt => ({ lat: lt[0], lng: lt[1] })));

    let responseData = {color,latlong}
    console.log(responseData);
    }
    catch (err) {
      console.log(err);
    }  
}

static async JobDetails(Data){
    let result = [];
    for(const element of Data){
      var obj = {};
      let location = await axios.get(process.env.MAPAPI,{
        params:{
          address:element.Address,
          key:process.env.APIKEY
        }
       })
      
        let address = element.Address
        let lat = location.data.results[0].geometry.location.lat;
        let lng = location.data.results[0].geometry.location.lng;
        let jobs = {
            "description": element.Address,
            "id": 1,
            "delivery": [
              1
            ],
            "skills": [
              1
            ],
            "location": [
              lng,
              lat
            ],
            "service": 1800
        }
       result.push(jobs)
    }
    return result;
}

static async InspectorDetails(Data){
  let result = [];
  for(const element of Data){
    // console.log(element.Address);
    let location = await axios.get(process.env.MAPAPI,{
      params:{
        address:element.Address,
        key:process.env.APIKEY
      }
     })
      let lat = location.data.results[0].geometry.location.lat;
      // console.log(lat);
      let lng = location.data.results[0].geometry.location.lng;
      let inspector = {
            "start": [
              lat,
              lng
            ],
            "end": [
              lat,
              lng
            ],
            "description": element.InspectorName,
            "id": 1,
            "capacity": [
              5
            ],
            "skills": [
              1,
              5
            ],
            "time_window": [
              0,
              28800
            ]
      }
     result.push(inspector)
  }
  return result;
}

static getRoutePathJson = async(req,res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if(fileExtension === 'xlsx') 
    {
      const excelFileBuffer = req.file.buffer;
      const workbook = xlsx.read(excelFileBuffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      const worksheet = workbook.Sheets[sheetNames[0]];
      const sheet2 = workbook.Sheets[sheetNames[1]];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      const sheetTwoData = xlsx.utils.sheet_to_json(sheet2);
      let jobs = await this.JobDetailsData(jsonData);  
      let inspector = await this.InspectorDetailsData(sheetTwoData); 
    }
   
    if(fileExtension === 'json')
    {
      const fileBuffer = req.file.buffer;
      const jsonData = JSON.parse(fileBuffer.toString());
      let jobs = await this.JobDetailsData(jsonData.GetRouteOptimizationInspectionListResult[0].Inspections);
      let inspector = await this.InspectorDetailsData(jsonData.GetRouteOptimizationInspectionListResult[0].Inspectors);  
    }

}
  catch (err) {
    console.log(err);
  }  
}

static async InspectorDetailsData(Data)
{
  const columnNames = Object.keys(Data[0]);
  let hitCount = 0
  const promises = Data.map(async (element) => {
    const inspectorName = element[columnNames[0]];
    const location = await axios.get(process.env.MAPAPI, {
      params: {
        address: element.Address,
        key: process.env.APIKEY
      }
    });
    if (location && location.data.results.length > 0) {
      const getlocation = location.data.results[0].geometry.location;
      const lat = getlocation.lat;
      const lng = getlocation.lng;
      hitCount++
      return {
        start: [lat, lng],
        end: [lat, lng],
        description: inspectorName,
        id: hitCount,
        capacity: [5],
        skills: [1, 5],
        time_window: [0, 28800]
      }
    }
    return null;
  })
  const results = await Promise.all(promises);
  return results.filter((result) => result !== null);
}


static async JobDetailsData(Data) {
  const promises = Data.map(async (element) => {
    let result = null;
    let hitCount = 0
    if (element.Address) {
      const getLocation = await axios.get(process.env.MAPAPI, {
        params: {
          address: element.Address,
          key: process.env.APIKEY
        }
      });

      if (getLocation && getLocation.data.results.length > 0) {
        const location = getLocation.data.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
        hitCount++
        result = {
          description: element.Address,
          id: hitCount,
          delivery: [1],
          skills: [1],
          location: [lng, lat],
          service: 1800
        };
      }
    }

    return result;
  });

  const results = await Promise.all(promises);
  return results.filter((result) => result !== null);
}

static async getAllData(req, res) {
  try {
    const config = {
      method: 'post',
      url: process.env.APIURL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(req.body)
    };

    const response = await axios(config);

    if (response.data) {
      console.log(response.data);
      // Process the response data here
      // You can add your logic to handle the response
      res.send(response.data);
    } else {
      console.log("No data received from the API");
      // Handle the case when no response data is available
      throw new Error("No data received from the API");
      // You can decide how to handle this situation, such as throwing an error or taking alternative actions
    }
  } catch (error) {
    // console.error('API request failed:', error);
    res.status(500).json({ error: error.message });
  }
}




}

module.exports = routePlannerController;