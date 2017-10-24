import ReactDOM from 'react-dom';
import React, {Component} from 'react';
const {isURL} = require('validator');


class App extends Component {

    state = {
        currentUrl: null,
        voteHistory: null,
        vote: null
    };

    componentDidMount = () => {

        // identify the current page
        chrome.tabs.query({
            'active': true,
            'lastFocusedWindow': true
        }, (tabs) => {

            let url = tabs[0].url;
            url = (url.includes("?") ? url.split("?")[0] : url);

            if (isURL(url)) {
                this.setState({
                    currentUrl: url
                });
                // retrieve the vote history from server
                fetch('http://localhost:4800/votes?url=' + url).then((response) => {
                    return response.json();
                }).then((obj) => {
                    this.setState({
                        voteHistory: (obj.score ? (obj.score * 100).toFixed(2) : null)
                    });
                })
            }
        });
    };

    handleVote = (vote) => {

        this.setState({vote});

        // add or update vote for the current page
        fetch('http://localhost:4800/vote', {
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

    // TODO: rate limiting with Redis cache key is ip, TTL is value
    // TODO: clean up UI: display vote in pop-up, or add a dynamic meter as a visual indicator

    // TODO: v2: handle diff URLs for same page, also score by root domain, canonical tags

    render() {
        console.log(this.state.currentUrl);
        console.log(typeof(this.state.currentUrl));
        return (
            <div className="App">
                { !(this.state.currentUrl) ?
                    <div className="not-url">
                        <p> This is not a page you can vote on. </p>
                    </div>
                    :
                    <div className="votable">
                        <div className="intro">
                            <div className="intro-display">
                                <div className="intro-icon">
                                    <i className="fa fa-tachometer fa-5x"/>
                                </div>
                                <div className="intro-cta">
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
                    }
            </div>
        );
    };

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
