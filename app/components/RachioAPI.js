import React from 'react';
import apis from '../utils/apis';
import Loading from './Loading';

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
      return <h1>personID: {this.state.personID}</h1>;
    }
    else
    {
      return <Loading text="Loading..." />;
    }
  }
}

module.exports = RachioAPI;
