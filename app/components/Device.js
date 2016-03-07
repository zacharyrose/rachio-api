import React from 'react';
import apis from '../utils/apis';
import Zone from './Zone';
import Spinner from './Spinner';

/******************************************************************
This component represents a single device.  Zone state is managed
here in a list in order to water multiple zones if needed,
and passed down to zones so that they can listen for state changes
******************************************************************/
class Device extends React.Component {

  constructor() {
    super();
    this.state = {
      zoneList:{},  //used to map zones and control individual zone state from parent level
      zonesToWater:{}, //filtered list used during the process of visualizing zone/start_multiple api
      zonesToWater_Index:0, //current index in water zone cycle
      wateringZones:false, //is the device currently in the process of watering multiple zones
      loading: false //true when waiting for api response
    };

    //initialize a simpler version of the list of zones (zoneList)
    this.initializeZoneList = this.initializeZoneList.bind(this);

    /*************** utility functions **************************/
    this.getZoneIndex = this.getZoneIndex.bind(this); //get zone index from main zoneList{} for zonesToWater{}
    this.zonesCurrentlyWatering = this.zonesCurrentlyWatering.bind(this); //returns number of zones currently being watered (should always be <=1)

    /******************** zone callbacks ***********************/
    this.setZoneDuration = this.setZoneDuration.bind(this); //register change in duration
    this.toggleZone = this.toggleZone.bind(this); //register a checkbox
    this.setZoneLoading = this.setZoneLoading.bind(this); //set to true when zone is waiting for api response
    this.moveZone = this.moveZone.bind(this); //move a zone up or down in the list
    this.waterZone = this.waterZone.bind(this); //water a single zone (just handles zone state, not api call)

    /*********************** Water Multiple Zones ***************/
    this.clearWateringZones = this.clearWateringZones.bind(this); //revert zonesToWater states
    this.waterZones = this.waterZones.bind(this); //Calls zone/start_multiple api and starts first waterNextZone()
    this.waterNextZone = this.waterNextZone.bind(this); //Calls next waterZone(), incrementally handling zone states

    /********************* misc ******************/
    this.reverseList = this.reverseList.bind(this); //reverse entire zoneList
  }

  componentWillMount ()
  {
    this.initializeZoneList();
  }

  initializeZoneList()
  {
    var zoneList = this.props.device.zones.map( zone =>{
      return ({
        id: zone.id,
        name: zone.name,
        zoneNumber: zone.zoneNumber, //used for sorting
        checked: false, //updates when user checks a zone
        loading: false, //zone is waiting for api call
        watering:false, //zone has sucessfully recieved api call and is currently watering
        duration: 5 //default duration: 5 seconds
        })
      }).sort( (a,b) => {
        return a.zoneNumber - b.zoneNumber;
      });

    console.log("zoneList: ", zoneList);

    this.setState({zoneList});
  }

  /*************** utility functions **************************/
  getZoneIndex(id)
  {
    return this.state.zoneList.map( zone => {
      return zone.id;
    }).indexOf(id);
  }

  zonesCurrentlyWatering()
  {
    var waterCheck = this.state.zoneList.filter( zone => {
      return zone.watering || zone.loading;
    });
    return waterCheck.length;
  }

  /******************** zone callbacks ***********************/
  setZoneDuration(index, duration)
  {
    var newList = this.state.zoneList.slice();
    newList[index].duration = duration;
    this.setState({zoneList: newList});
  }

  toggleZone(index)
  {
    var newList = this.state.zoneList.slice();
    newList[index].checked = !newList[index].checked;
    this.setState({zoneList: newList});
  }

  setZoneLoading(index, value)
  {
    var newList = this.state.zoneList.slice();
    newList[index].loading = value;
    this.setState({zoneList: newList});
  }

  moveZone(index, direction)
  {
    if (typeof this.state.zoneList[index + direction] != 'undefined') //check if moving out of bounds of list
    {
      var newList = this.state.zoneList.slice();
      newList[index + direction] = this.state.zoneList[index];
      newList[index] = this.state.zoneList[index+direction];

      this.setState({zoneList:newList});
    }
  }

  waterZone(index, action)
  {
    var newList = this.state.zoneList.slice();

    if (action === "START")
    {
      if (this.zonesCurrentlyWatering() > 0)
      {
        alert("Please wait for other zones to finish");
      }
      else
      {
        newList[index].watering = true;
        this.setState({zoneList:newList});
      }
    }
    else if (action === "STOP" || action === "STOP_ALL")
    {
      newList[index].watering = false;
      this.setState({zoneList:newList});

      if (this.state.wateringZones && action != "STOP_ALL")
      {
        this.setState({zonesToWater_Index: this.state.zonesToWater_Index+1}, ()=> {
          this.waterNextZone();
        });
      }
      else if (action === "STOP_ALL")
      {
        this.clearWateringZones();
      }
    }

  }

  /*********************** Water Multiple Zones ***************/
  clearWateringZones()
  {
    this.setState({wateringZones:false, zonesToWater:[], zonesToWater_Index:0});
  }

  waterNextZone()
  {
    if (this.state.zonesToWater_Index < this.state.zonesToWater.length)
    {
      var nextID = this.state.zonesToWater[ this.state.zonesToWater_Index ].id;
      var index = this.getZoneIndex(nextID);
      this.waterZone(index, "START" );
    }
    else {
      this.clearWateringZones();
    }
  }

  waterZones(e)
  {
    e.preventDefault();

    if (this.zonesCurrentlyWatering() > 0)
    {
      alert("Please wait for other zones to finish");
    }
    else {
      var zonesToWater = this.state.zoneList.filter(
        zone => { return zone.checked }); //filter out only zones that are checked

      if (zonesToWater.length === 0)
      {
        alert("No Zones Selected.");
      }
      else {
        this.setState({loading: true});
        apis.zoneStartMultiple(zonesToWater)
          .then (
            res => {
              this.setState({loading: false});
              console.log(res);

              //set appropriate states and start watering visualization process
              this.setState({wateringZones:true, zonesToWater, zonesToWater_Index:0},
                ()=>{ this.waterNextZone() });

            },
            error => {
              this.setState({loading: false});
              console.log(error);
              alert("Error: "+ error.statusText);
            })
          }
    }
  }

  /********************* misc ******************/
  reverseList()
  {
    var newList = [];
    this.state.zoneList;
    for (var i=this.state.zoneList.length-1; i>=0; i--)
    {
      newList.push(this.state.zoneList[i]);
    }
    this.setState({zoneList:newList});
  }

  render()
  {
    return (
      <div>
        <h3>{this.props.device.name} (model {this.props.device.model})</h3>
        <h3>
          Status: <strong>{this.props.device.status}</strong>
        </h3>
        <div className="zoneContainer">
          <ul className="zoneList">
            <li className="zoneListTitle">
              <h1>Zones</h1>
              <h3 className="reverse">(<a onClick={this.reverseList}>Reverse Zone Order</a>)</h3>
              {(() => {
                if(this.state.loading)
                {
                  return <h3>Loading...<Spinner /></h3>;
                }
                else if(this.state.wateringZones || this.zonesCurrentlyWatering())
                {
                  return <h3>Watering...</h3>;
                }
                else return <h3><a className="waterbutton" onClick={this.waterZones}>Water Selected Zones</a></h3>
              })()}
            </li>
            {
              this.state.zoneList.map( (zone, index) => {
                return (
                  <Zone key={zone.id}
                        zone={zone}
                        zoneIndex={index}
                        deviceID={this.props.device.id}
                        parentLoading={this.state.loading}
                        zonesCurrentlyWatering={this.zonesCurrentlyWatering}
                        waterCallback={this.waterZone}
                        loadingCallback={this.setZoneLoading}
                        moveCallback={this.moveZone}
                        toggleCallback={this.toggleZone}
                        durationCallback={this.setZoneDuration} />
                );
              })
            }
          </ul>
        </div>
      </div>
    )
  }

}

module.exports = Device;
