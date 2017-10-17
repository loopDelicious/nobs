import ReactDOM from 'react-dom';
import React, { Component } from 'react';

class App extends Component {

  render() {
    return (
      <div className="App">
        <p>hello world!</p>
      </div>
    );
  }

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
