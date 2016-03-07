import React from 'react';
import apis from '../utils/apis';
import Device from './Device';
import Loading from './Loading';

/*********************************************************************************
This component is the main parent. Here all the necessary data is loaded from
the person/:id call and loaded into it's person state.  From here smaller objects
are passed down to its children and grandchildren (devices and zones)
*********************************************************************************/

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      person: {},
      loaded:false
    };

    //makes the api call and places the data into the person object.
    this.update=this.update.bind(this);
  }

  componentWillMount() {
    this.update(); //update() is pulled out into its own function in case we need to update the data later
  }

  update()
  {
    this.setState({loaded: false}, () =>
    {
      apis.person(this.props.personID)
      .then (
        res => { //Grab the top-level person object
          this.setState({person: res.data}, () => {
            console.log("Person:", this.state.person.fullName, this.state.person);
            this.setState({loaded:true}); //set loaded to true so page can render
          });
        })
    })
  }

  render()
  {
    if(this.state.loaded)
    {
      return (
        <div className="dashboard">
          <h1>{this.state.person.fullName}&#39;s Dashboard</h1>
          <h2>Devices</h2>
          {     //map all devices (in this case 1, but could potentially be greater)
            this.state.person.devices.map( device => {
              return <Device key={device.id} device={device} />;
            })
          }
        </div>
      );
    }
    else return <Loading text="Loading Dashboard..." />;
  }

}
module.exports = Dashboard;
