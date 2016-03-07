import React from 'react';
import apis from '../utils/apis';
import Zone from './Zone';
import Spinner from './Spinner';

class Device extends React.Component {

  constructor() {
    super();
    this.state = {
      zoneList:{},
      loading: false
    };
    this.waterZones = this.waterZones.bind(this);
    this.initializeZoneList = this.initializeZoneList.bind(this);
    this.setZoneDuration = this.setZoneDuration.bind(this);
    this.toggleZone = this.toggleZone.bind(this);
    this.deviceToggle = this.deviceToggle.bind(this);
    this.reverseList = this.reverseList.bind(this);
    this.moveZone = this.moveZone.bind(this);
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
        zoneNumber: zone.zoneNumber,
        checked: false,
        duration: 60
        })
      }).sort( (a,b) => {
        return a.zoneNumber - b.zoneNumber;
      });

    console.log("zoneList: ", zoneList);

    this.setState({zoneList});
  }

  setZoneDuration(zoneID, duration)
  {
    /*
    While it would be simpler to pass the zone object
    and simply change its member variable directly,
    we must change the state this way, because
    React states are immutable.
    */
    var zoneListNew = this.state.zoneList;
    for (var i=0; i<zoneListNew.length; i++)
    {
      if (zoneListNew[i].id === zoneID)
        {
          zoneListNew[i].duration = duration;
          this.setState({zoneList: zoneListNew}, () =>{console.log ("new duration", this.state.zoneList)});
          break;
        }
    }

  }

  toggleZone(zoneID)
  {
    //Must change state this way to to reasons stated in setZoneDuration()
    var zoneListNew = this.state.zoneList;
    for (var i=0; i<zoneListNew.length; i++)
    {
      if (zoneListNew[i].id === zoneID)
        {
          zoneListNew[i].checked = !zoneListNew[i].checked;
          this.setState({zoneList: zoneListNew}, () => {console.log ("toggle", this.state.zoneList)} );
          break;
        }
    }

  }

  waterZones(e)
  {
    e.preventDefault();

    var zonesToWater = this.state.zoneList.filter(
      zone => {
        return zone.checked;
    });

    console.log("zonesToWater", zonesToWater);

    if (zonesToWater.length === 0)
    {
      alert("No Zones Selected!");
    }
    else {
      this.setState({loading: true});
      apis.zoneStartMultiple(zonesToWater)
        .then (
          res => {
            this.setState({loading: false});
            console.log(res);
          },
          error => {
            this.setState({loading: false});
            console.log(error);
            alert("Error: "+ error.statusText);
          })
      }
  }

  deviceToggle(e)
  {
    e.preventDefault();
    this.setState({loaded:false}, () => {});

    if (this.props.device.status === "OFFLINE")
    {
      apis.deviceOn(this.props.deviceID)
      .then( () => { this.update(); });
    }
    else if (this.props.device.status === "ONLINE") {
      apis.deviceOff(this.props.deviceID)
      .then( () => { this.update(); });
    }
  }

  reverseList()
  {
    var newList = [];
    this.state.zoneList;
    for (var i=this.state.zoneList.length-1; i>=0; i--)
      {
        newList.push(this.state.zoneList[i]);
      }
    console.log ("newList:", newList);
    this.setState({zoneList:newList}, () => {
      console.log ("newZoneList:", this.state.zoneList);
    });
  }

  moveZone(index, direction)
  {
    if (typeof this.state.zoneList[index + direction] != 'undefined')
    {
      var newList = this.state.zoneList;
      var newZone = this.state.zoneList[index + direction];
      newList[index + direction] = this.state.zoneList[index];
      newList[index] = newZone;

      this.setState({zoneList:newList});
    }
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
              Zones <br />
              {/*<small><a onClick={this.reverseList}>Reverse Zone Order</a></small><br />*/}
              <a className="waterbutton" onClick={this.waterZones}>Water Selected Zones</a>
              {(() => {
                if(this.state.loading)
                {
                  return <h3>Loading...<Spinner /></h3>;
                }
              })()}
            </li>
            {
              this.state.zoneList.map( (zone, index) => {
                return (
                  <Zone key={zone.id} zone={zone} zoneIndex={index} moveCallback={this.moveZone} toggleCallback={this.toggleZone} durationCallback={this.setZoneDuration} />
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
