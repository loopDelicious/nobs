import ReactDOM from 'react-dom';
import React, {Component} from 'react';

class App extends Component {

    state = {
        currentUrl: null
    };

    componentDidMount = () => {
        chrome.tabs.query({
            'active': true,
            'lastFocusedWindow': true
        }, (tabs) => {
            const url = tabs[0].url;
            this.setState({
                currentUrl: url
            });
        });
    };

    render() {
        return (
            <div className="App">
                <div className="current-page">
                    <div id="message">
                        <p>{this.state.currentUrl}</p>
                    </div>
                </div>
                <div className="voting">
                    <p>Is this website truthy or falsey?</p>
                    <i className="fa fa-tachometer fa-5x"/>
                </div>

            </div>
        );
    }

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
