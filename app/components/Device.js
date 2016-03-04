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
    this.initializeZoneList = this.initializeZoneList.bind(this);
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
        duration: 60
        })
      });

    console.log("zoneList: ", zoneList);

    this.setState({zoneList}, () => {
      this.setState({zoneListInitalized:true});
      this.setState({loaded:true});
    });
  }

  render()
  {
    if(this.state.loaded)
    {
      return (
        <div>
          <h3>{this.state.device.name} (model {this.state.device.model})</h3>
          <div className="zoneContainer">
            <ul className="zoneList">
              <li className="zoneListTitle">
                Zones <br />

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
