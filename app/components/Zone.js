import React from 'react';
import apis from '../utils/apis';
import Spinner from './Spinner';

class Zone extends React.Component {
  constructor() {
    super();
    this.state = {
      zone: {}//,
      //loaded:false
    };
    this.update=this.update.bind(this);
    this.waterZone = this.waterZone.bind(this);
  }

  componentWillMount() {
    this.update();
  }

  update()
  {
    this.setState({loaded: false}, () =>
    {
      apis.zone(this.props.zoneID)
      .then (
        res => {
          this.setState({zone: res.data}, () => {
            console.log("Zone:",this.state.zone.name, this.state.zone);
            //this.setState({loaded:true});
          });
        })
    })
  }

  waterZone(e)
  {
    e.preventDefault();
    apis.zoneStart(this.state.zone.id, 60)
      .then(
        res => {
          console.log(res);
        })
  }

  render()
  {
    return (
      <li className="zone">
        <div className="zoneBox">
          <input type="checkbox" />
          {this.state.zone.name}
        </div>
        <div className="zoneBox">
          <select className="zoneSelect">
            <option value="0">0 min</option>
            <option value="60">1 min</option>
            <option value="120">2 min</option>
            <option value="180">3 min</option>
            <option value="240">4 min</option>
            <option value="300">5 min</option>
            <option value="360">6 min</option>
          </select>
          <a className="waterbutton" onClick={this.waterZone}>Water</a>
        </div>
      </li>
    )
  }

}

module.exports = Zone;
