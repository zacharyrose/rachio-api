import React from 'react';
import ReactDOM from 'react-dom';
import RachioAPI from './Components/RachioAPI';

const App = () => (
  <div>
    <RachioAPI />
  </div>
);
ReactDOM.render(<App />, document.getElementById('app'));
