import React from 'react';
import Spinner from './Spinner';


class Loading extends React.Component {
  render() {
    return (
      <div className="loading">
        <h1>
          {this.props.text}
          <i className="fa fa-spinner fa-spin"></i>
        </h1>
      </div>
    );
  }
}

module.exports = Loading;
