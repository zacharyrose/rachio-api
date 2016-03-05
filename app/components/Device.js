import React from 'react';
import apis from '../utils/apis';
import Zone from './Zone';
import Spinner from './Spinner';

class Device extends React.Component {

  constructor() {
    super();
    this.state = {
      device: {},
      zoneList:{},
      zoneListInitalized:false,
      loaded:false
    };
    this.update=this.update.bind(this);
    this.waterZones = this.waterZones.bind(this);
    this.initializeZoneList = this.initializeZoneList.bind(this);
    this.setZoneDuration = this.setZoneDuration.bind(this);
    this.toggleZone = this.toggleZone.bind(this);
    this.deviceToggle = this.deviceToggle.bind(this);
  }

  componentWillMount() {
    this.update();
  }

  update()
  {
    this.setState({loaded: false}, () =>
    {
      apis.device(this.props.deviceID)
      .then (
        res => {
          this.setState({device: res.data}, () => {
            console.log("Device:", this.state.device.name, this.state.device);
            if (this.state.zoneListInitalized)
            {
              this.setState({loaded:true});
            }
            else
            {
              this.initializeZoneList();
            }

          });
        })
    })
  }


  initializeZoneList()
  {
    var zoneList = this.state.device.zones.map( zone =>{
      return ({
        id: zone.id,
        name: zone.name,
        zoneNumber: zone.zoneNumber,
        checked: false,
        duration: 60
        })
      });

    console.log("zoneList: ", zoneList);

    this.setState({zoneList}, () => {
      this.setState({zoneListInitalized:true});
      this.setState({loaded:true});
    });
  }

  setZoneDuration(zoneID, duration)
  {
    var zoneListNew = this.state.zoneList;
    for (var i; i<zoneListNew.length; i++)
    {
      if (zoneListNew[i].id === zoneID)
        {
          zoneListNew[i].duration = duration;
          this.setState({zoneList: zoneListNew});
          break;
        }
    }

  }

  toggleZone(zoneID)
  {
    for (var i; i<this.state.zoneList.length; i++)
    {
      if (zoneListNew[i].id === zoneID)
        {
          this.setState({checked: !this.state.zoneList.checked});
          break;
        }
    }
  }

  waterZones(e)
  {
    e.preventDefault();
    apis.zoneStartMultiple(this.state.zoneList)
      .then (
        res => {
          console.log(res);
        })
  }

  deviceToggle(e)
  {
    e.preventDefault();
    this.setState({loaded:false}, () => {});

    if (this.state.device.status === "OFFLINE")
    {
      apis.deviceOn(this.props.deviceID)
      .then( () => { this.update(); });
    }
    else {
      apis.deviceOff(this.props.deviceID)
      .then( () => { this.update(); });
    }

  }

  render()
  {
    if(this.state.loaded)
    {
      return (
        <div>
          <h3>{this.state.device.name} (model {this.state.device.model})</h3>
          <h3>
            Status: <strong>{this.state.device.status}</strong>
            <a className="waterbutton" onClick={this.deviceToggle}>On/Off</a>
          </h3>
          <div className="zoneContainer">
            <ul className="zoneList">
              <li className="zoneListTitle">
                Zones <br />
                <a className="waterbutton" onClick={this.waterZones}>Water All Zones</a>
              </li>
              {
                this.state.device.zones.map( zone => {
                  return (
                    <Zone key={zone.id} zoneID={zone.id} />
                  );
                })
              }
            </ul>
          </div>
        </div>
      )
    }
    else
    {
      return <h4><Spinner /></h4>
    }
  }

}

module.exports = Device;
