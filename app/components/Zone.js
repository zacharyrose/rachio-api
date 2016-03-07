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
      watering: false
    };
    this.waterZone = this.waterZone.bind(this);
    this.setDuration = this.setDuration.bind(this);
    this.toggle = this.toggle.bind(this);

    this.tick = this.tick.bind(this);
    this.startWatering = this.startWatering.bind(this);
    this.stopWatering = this.stopWatering.bind(this);
    this.stopWateringAll = this.stopWateringAll.bind(this);

    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.zone.watering && !this.state.watering)
    {
      this.setState({watering:true}, ()=>{
        this.startWatering();
      })
    }
  }

  tick() {
    this.setState({time: this.state.time + 1});
    if (this.state.time > this.props.zone.duration) {
      this.stopWatering();
    }
  }


  startWatering() {
    this.interval = setInterval(this.tick, 1000);
    this.setState({time: 0});
  }

  stopWatering()
  {
    clearInterval(this.interval);
    this.setState({watering:false}, ()=>{
      this.props.waterCallback(this.props.zoneIndex, "STOP");
    });
  }

  stopWateringAll()
  {
    this.setState({stopping:true});
    apis.deviceStopWater(this.props.deviceID)
      .then(
        res => {
          this.setState({watering:false}, ()=>{
            console.log(res);
            clearInterval(this.interval);
            this.setState({stopping:false});
            this.props.waterCallback(this.props.zoneIndex, "STOP_ALL");
          });
        }
      )
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
    else if (this.props.zone.watering || this.props.zone.loading)
    {
      alert("Zone Already watering");
    }
    else {
      if (this.props.zonesCurrentlyWatering() > 0)
      {
        alert("Please wait for other zones to finish");
      }
      else {
      this.props.loadingCallback(this.props.zoneIndex,true);
      apis.zoneStart(this.props.zone.id, this.props.zone.duration) //duration set in parent by callback
        .then(
          res => {
            this.props.loadingCallback(this.props.zoneIndex,false);
            this.props.waterCallback(this.props.zoneIndex, "START");
            console.log(res);
          },
          error => {
            this.props.loadingCallback(this.props.zoneIndex,false);
            console.log(error);
            alert("Error: "+ error.statusText);
          })
        }
    }
  }

  setDuration(e)
  {
    this.props.durationCallback(this.props.zoneIndex, e.target.value);
  }

  toggle(e)
  {
    this.props.toggleCallback(this.props.zoneIndex);
  }

  moveUp(e)
  {
    this.props.moveCallback(this.props.zoneIndex, -1);
  }

  moveDown(e)
  {
    this.props.moveCallback(this.props.zoneIndex, 1);
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
          if(this.props.zone.loading)
          {
            return <div className="zoneBox"><p>Loading...<Spinner /></p></div>;
          }
          else if(this.props.zone.watering)
          {
            return (
              <div className="zoneBox">
              <h3>
                <img src={nozzlePic} style={nozzleImageStyle}/>
                {timeToMinutes(this.state.time)}

                {(() => {
                  if (this.state.stopping)
                  {
                    return <Spinner />;
                  }
                  else {
                    return <a onClick={this.stopWateringAll}><i className="fa fa-times"></i></a>
                  }
                })()}

              </h3>
              </div>
            );
          }
        })()}

        <div className="zoneBox zoneBoxRight">
          <div className="zoneBox">
            <select onChange={this.setDuration} className="zoneSelect">
              <option value="5">5 sec</option>
              <option value="10">10 sec</option>
              <option value="15">15 sec</option>
              <option value="20">20 sec</option>
              <option value="25">25 sec</option>
              <option value="30">30 sec</option>
            </select>
            <a className="waterbutton" onClick={this.waterZone}>Water</a>
          </div>
          <div className="zoneMove">
            <a onClick={this.moveUp}><i className="fa fa-arrow-up"></i></a>
            <a onClick={this.moveDown}><i className="fa fa-arrow-down"></i></a>
          </div>
        </div>

      </li>
    )
  }

}

module.exports = Zone;
