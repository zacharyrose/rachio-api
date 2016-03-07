import React from 'react';
import apis from '../utils/apis';
import Spinner from './Spinner';

//nozzle pic grabbed from zone object
const nozzlePic = "https://s3-us-west-2.amazonaws.com/rachio-api-icons/nozzle/fixed_spray.png";
const nozzleImageStyle = {
  height:'1.5rem',
  position:'relative',
  top:'.25rem'
}

//used for visualizing watering counter
const timeToMinutes = time =>
{
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return minutes + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

/*************************************************************************************************
This component represents a single zone.  zone/start and device/stop_water apis are handled here,
but most states concerning watering visualization are handled in parent Device component
*************************************************************************************************/
class Zone extends React.Component {
  constructor() {
    super();
    this.state = {
      time: 0,       //interval to show watering
      stopping: false, //used to show spinner when device/stop_water api is called
      watering: false //used as a flag so that zone will handle receiving watering state only once
    };

    /*************** Counter Visualization *****************/
    this.tick = this.tick.bind(this); //counter tick
    this.startWatering = this.startWatering.bind(this); //start counter
    this.stopWatering = this.stopWatering.bind(this); //stop counter, callback to parent to set state

    /*************** Click Events *****************/
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.setDuration = this.setDuration.bind(this); //send callback to change duration
    this.toggle = this.toggle.bind(this); //send callback to toggle user zone selection
    this.waterZone = this.waterZone.bind(this); //makes zone/start api call, callback to parent to set state
    this.stopWateringAll = this.stopWateringAll.bind(this); //makes device/stop_water api call

  }

  //if zone's props change, check to see if watering has been set to true
  componentWillReceiveProps(newProps) {
    if (newProps.zone.watering && !this.state.watering) //check that watering flag isn't already checked
    {
      this.setState({watering:true}, ()=>{   //set watering flag to avoid multiple intervals
        this.startWatering();                //start the counter
      })
    }
  }

  componentWillUnmount()
  {
    clearInterval(this.interval); //stop interval when component unmounts
  }

  /*************** Counter Visualization *****************/

  tick() {
    this.setState({time: this.state.time + 1}, () => {
      if (this.state.time > this.props.zone.duration) {
        this.stopWatering();
      }
    });
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

  /*************** Click Events *****************/

  stopWateringAll()
  {
    this.setState({stopping:true}); //set spinner instead of stop watering link
    apis.deviceStopWater(this.props.deviceID) //call device/stop_water api
      .then(
        res => {
          this.setState({watering:false}, ()=>{
            console.log(res);
            clearInterval(this.interval); //stop counter
            this.setState({stopping:false}); //remove stopping spinner
            this.props.waterCallback(this.props.zoneIndex, "STOP_ALL"); //callback to parent to set state
          })
        },
        error => {
          this.setState({stopping:false}); //remove stopping spinner
          console.log(error);
          alert("Error: "+ error.statusText);
        });
  }

  waterZone()
  {
    if (this.props.zone.duration <=0) //make sure duration > 0
    {
      alert("Please set duration");
    }
    else if (this.props.zone.watering || this.props.zone.loading) //check if current zone is watering or waiting on api
    {
      alert("Zone already watering");
    }
    else if (this.props.parentLoading || this.props.zonesCurrentlyWatering() > 0) //make sure no other zones are currently watering
    {
      alert("Please wait for other zones to finish");
    }
    else {
    this.props.loadingCallback(this.props.zoneIndex,true);
    apis.zoneStart(this.props.zone.id, this.props.zone.duration) //duration set in parent by callback
      .then(
        res => {
          this.props.loadingCallback(this.props.zoneIndex, false); //set loading state to false
          this.props.waterCallback(this.props.zoneIndex, "START"); //start counter
          console.log(res);
        },
        error => {
          this.props.loadingCallback(this.props.zoneIndex,false);
          console.log(error);
          alert("Error: "+ error.statusText);
        })
      }

  }

  setDuration(e)
  {
    this.props.durationCallback(this.props.zoneIndex, e.target.value);
  }

  toggle()
  {
    this.props.toggleCallback(this.props.zoneIndex);
  }

  moveUp()
  {
    this.props.moveCallback(this.props.zoneIndex, -1);
  }

  moveDown()
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
            {(() => {
              if (this.props.zone.watering || this.props.zone.loading || this.props.zonesCurrentlyWatering() > 0)
              {
                return <a></a>;
              }
              else
              {
                return <a className="waterbutton" onClick={this.waterZone}>Water</a>;
              }
            })()}
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
