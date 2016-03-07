import React from 'react';
import apis from '../utils/apis';
import Dashboard from './Dashboard';
import Loading from './Loading';

/****************************************************************************
In this component, we simply make the call to person/info and receive the ID,
which is then passed into the Dashboard
****************************************************************************/

class RachioAPI extends React.Component {
  constructor() {
    super();
    this.state = {
      personID:'',
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
      apis.personInfo()
      .then (
        res => { //take id from personInfo req to pass into Dashboard Component
          this.setState({personID: res.data.id}, () => {
            console.log("personID", this.state.personID);
            this.setState({loaded:true}); //set loaded to true so page can render
        });
      })
    })
  }

  render()
  {
    if (this.state.loaded)
    {
      return <Dashboard personID={this.state.personID} />;
    }
    else
    {
      return <Loading text="Loading..." />;
    }
  }
}

module.exports = RachioAPI;
