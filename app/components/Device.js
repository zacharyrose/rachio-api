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

  setZoneDuration(index, duration)
  {
    var newList = this.state.zoneList.slice();
    newList[index].duration = duration;
    this.setState({zoneList: newList}, () =>{console.log ("new duration", this.state.zoneList)});
  }

  toggleZone(index)
  {
    var newList = this.state.zoneList.slice();
    newList[index].checked = !newList[index].checked;
    this.setState({zoneList: newList}, () => {console.log ("toggle", this.state.zoneList)} );
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
      alert("No Zones Selected.");
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
      var newList = this.state.zoneList.slice();
      newList[index + direction] = this.state.zoneList[index];
      newList[index] = this.state.zoneList[index+direction];

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
