import React from 'react';
import apis from '../utils/apis';
import Spinner from './Spinner';

class Zone extends React.Component {
  constructor() {
    super();
    this.state = {
      duration:0,
      checked:false
    };
    this.waterZone = this.waterZone.bind(this);
  }

  componentWillMount() {

  }

  waterZone(e)
  {
    e.preventDefault();
    apis.zoneStart(this.props.zone.id, 60)
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
          {this.props.zone.name}
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
