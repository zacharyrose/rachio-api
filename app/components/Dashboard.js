import React from 'react';
import apis from '../utils/apis';
import Loading from './Loading';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      person: {},
      loaded:false
    };
    this.update=this.update.bind(this);
  }

  componentWillMount() {
    this.update();
  }

  update()
  {
    this.setState({loaded: false}, () =>
    {
      apis.person(this.props.personID)
      .then (
        res => {
          this.setState({person: res.data}, () => {
            console.log("Person:", this.state.person.fullName, this.state.person);
            this.setState({loaded:true});
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
          {
            this.state.person.devices.map( device => {
              return <h3>{device.name} (model {device.model})</h3>;
            })
          }
        </div>
      );
    }
    else return <Loading text="Loading Dashboard..." />;
  }

}
module.exports = Dashboard;
