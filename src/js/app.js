import ReactDOM from 'react-dom';
import React, {Component} from 'react';

class App extends Component {

    state = {
        currentUrl: null,
        voteHistory: null,
        vote: null
    };

    componentDidMount = () => {

        //identify current page
        chrome.tabs.query({
            'active': true,
            'lastFocusedWindow': true
        }, (tabs) => {
            let url = tabs[0].url;
            url = (url.includes("?") ? url.split("?")[0] : url);
            this.setState({
                currentUrl: url
            });
            // retrieve vote history from server
            fetch('http://localhost:4800/votes?url=' + url).then((response) => {
                return response.json();
            }).then((obj) => {
                this.setState({
                    voteHistory: (obj.score ? (obj.score * 100).toFixed(2) : null)
                });
            })
        });
    };

    handleVote = (vote) => {

        this.setState({vote});

        fetch('http://localhost:4800/votes', {
            method: 'post',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                url: this.state.currentUrl,
                vote: vote
            })
        }).then((response) => {
            return response.json();
        }).then((obj) => {
            console.log(obj);
        });
    };

    // TODO: handle diff URLs for same page, discard query string (client and server side, also score by root domain, canonical tags
    // TODO: index on url lookup
    // TODO: input validation, no sql injection
    // TODO: rate limiting
    // TODO: clean up UI

    render() {
        return (
            <div className="App">
                <div className="intro">
                    <div className="intro-icon">
                        <div className="intro-icon">
                            <i className="fa fa-tachometer fa-5x"/>
                        </div>
                        <div className="intro-copy">
                            <h2>Is this page truthy or falsey?</h2>
                            <p className="urlName">{this.state.currentUrl}</p>
                            { this.state.voteHistory ?
                                <p>Truthiness: {this.state.voteHistory}%</p>
                                :
                                <p>This site doesn't have enough reports yet. Be one of the first!</p>
                            }
                        </div>
                    </div>
                </div>
                <div className="voting">
                    <button className="voteArrows" onClick={this.handleVote.bind(this, true)}>
                        Truthy &#x25B2;</button>
                    <br />
                    <button className="voteArrows" onClick={this.handleVote.bind(this, false)}>
                        Falsey &#x25BC;</button>
                </div>
            </div>
        );
    };

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
