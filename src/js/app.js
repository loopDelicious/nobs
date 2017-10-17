import ReactDOM from 'react-dom';
import React, {Component} from 'react';

class App extends Component {

    state = {
        currentUrl: null,
        vote: null
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

    handleUpvote = () => {
        this.setState({
            vote: 1
        }, console.log('upvoted'));
        // TODO: replace callback with call to server to log vote
        // TODO: display calculated % of truthy on this page
        // TODO: if none, encourage votes

    };

    handleDownvote = () => {
        this.setState({
            vote: 0
        }, console.log('downvoted'));
    };

    render() {
        return (
            <div className="App">

                <div className="voting">
                    <h2>Is this page truthy or falsey?</h2>
                    <p className="urlName">{this.state.currentUrl}</p>
                    <i className="fa fa-tachometer fa-5x"/><br />
                    <div className="voteArrows" onClick={this.handleUpvote.bind(this)}>&#x25B2;</div><br />
                    <div className="voteArrows" onClick={this.handleDownvote.bind(this)}>&#x25BC;</div>
                </div>

            </div>
        );
    }

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
