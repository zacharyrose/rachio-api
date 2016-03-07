import React from 'react';
import apis from '../utils/apis';
import Spinner from './Spinner';

const nozzlePic = "https://s3-us-west-2.amazonaws.com/rachio-api-icons/nozzle/fixed_spray.png";
const nozzleImageStyle = {
  height:'1.5rem',
  position:'relative',
  top:'.25rem'
}

const timeToMinutes = time =>
{
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return minutes + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

class Zone extends React.Component {
  constructor() {
    super();
    this.state = {
      time: 0,
      stopping: false,
      watering: false,
      loading:false
    };
    this.waterZone = this.waterZone.bind(this);
    this.setDuration = this.setDuration.bind(this);
    this.toggle = this.toggle.bind(this);

    this.tick = this.tick.bind(this);
    this.startWatering = this.startWatering.bind(this);
    this.stopWatering = this.stopWatering.bind(this);
  }

  tick() {
    this.setState({time: this.state.time + 1});
    if (this.state.time > this.props.zone.duration) {
      this.stopWatering();
    }
  }

  startWatering() {
    this.setState({watering:true}, () => {
      this.interval = setInterval(this.tick, 1000);
      this.setState({time: 0});
    });
  }

  stopWatering()
  {
    this.setState({watering:false}, () => {
      clearInterval(this.interval);
    });
  }

  componentWillUnmount()
  {
    clearInterval(this.interval);
  }

  waterZone(e)
  {
    e.preventDefault();

    if (this.props.zone.duration <=0)
    {
      alert("Please set duration");
    }
    else {
      this.setState({loading: true});
      console.log("Making zoneStart request...", this.props.zone.id, this.props.zone.duration);
      apis.zoneStart(this.props.zone.id, this.props.zone.duration) //duration set in parent by callback
        .then(
          res => {
            this.setState({loading: false});
            this.startWatering();
            console.log(res);
          },
          error => {
            this.setState({loading: false});
            console.log(error);
            alert("Error: "+ error.statusText);
          })
    }
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
          <h3>
            <input type="checkbox" onChange={this.toggle} />
            {this.props.zone.name}
          </h3>
        </div>

        {(() => {
          if(this.state.loading)
          {
            return <div className="zoneBox"><h3>Loading...<Spinner /></h3></div>;
          }
          else if(this.state.watering)
          {
            return (
              <div className="zoneBox">
              <h3>
                <img src={nozzlePic} style={nozzleImageStyle}/>
                {timeToMinutes(this.state.time)}
                
              </h3>
              </div>
            );
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
