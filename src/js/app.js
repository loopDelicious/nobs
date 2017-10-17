import ReactDOM from 'react-dom';
import React, { Component } from 'react';

class App extends Component {

  render() {
    return (
      <div className="App">
          <div className="current-page">
              <div id="message"></div>
          </div>
          <div className="voting">
              <p>Is this website truthy or falsey?</p>
              <i className="fa fa-tachometer fa-5x" />
          </div>

      </div>
    );
  }

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
