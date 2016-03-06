import React from 'react';
import apis from '../utils/apis';
import Spinner from './Spinner';

class Zone extends React.Component {
  constructor() {
    super();
    this.state = {
      loading:false
    };
    this.waterZone = this.waterZone.bind(this);
    this.setDuration = this.setDuration.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {

  }

  waterZone(e)
  {
    e.preventDefault();
    this.setState({loading: true});
    apis.zoneStart(this.props.zone.id, this.props.zone.duration) //duration set in parent by callback
      .then(
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

  setDuration(e)
  {
    this.props.durationCallback(this.props.zone.id, e.target.value);
  }

  toggle(e)
  {
    this.props.toggleCallback(this.props.zone.id);
  }

  render()
  {
    return (
      <li className="zone">
        <div className="zoneBox">
          <input type="checkbox" onChange={this.toggle} />
          {this.props.zone.name}
        </div>

        {(() => {
          if(this.state.loading)
          {
            return <div className="zoneBox"><h3>Loading...<Spinner /></h3></div>;
          }
        })()}

        <div className="zoneBox">
          <select onChange={this.setDuration} className="zoneSelect">
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
