import axios from 'axios';

const apiRoot = "https://api.rach.io/1/public/";
const rachioToken = "[hard coded for now]";
const config = {
  headers:
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer "+ rachioToken
  }
};

const apis = {
  personInfo: () => {
    return axios.get(apiRoot + "person/info", config);
  },
  person: personID => {
    return axios.get(apiRoot + "person/" + personID, config);
  },
  device: deviceID => {
    return axios.get(apiRoot + "device/" + deviceID, config);
  },
  zone: zoneID => {
    return axios.get(apiRoot + "zone/" + zoneID, config);
  },
  zoneStart: (id, duration) =>
  {
    var data = {id, duration};
    return axios.put(apiRoot + "zone/start", data, config);
  },
  zoneStartMultiple: (zones) =>
  {
    var data = {
      zones : zones.map( (zone, index) => {
        return { id: zone.id, duration: zone.duration, sortOrder: index }
      }) };

    return axios.put(apiRoot + "zone/start_multiple", data, config);
  }
}

module.exports = apis;
