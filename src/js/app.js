import ReactDOM from 'react-dom';
import React, {Component} from 'react';
const {isURL} = require('validator');


class App extends Component {

    state = {
        currentUrl: null,
        voteHistory: null,
        vote: null,
        previousVote: null
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
                });

                // retrieve the previous vote from server
                fetch('http://localhost:4800/vote?url=' + url).then((response) => {
                    return response.json();
                }).then((obj2) => {
                    console.log(obj2);
                    this.setState({
                        previousVote: (obj2 ? obj2.vote : null)
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

    // TODO: clean up UI: display vote in pop-up, or add a dynamic meter as a visual indicator
    // TODO: v2: handle diff URLs for same page, also score by root domain, canonical tags

    render() {

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
                                        <p className="truthy-level">Truthiness-level: {this.state.voteHistory}%</p>
                                        :
                                        <p>Be one of the first to rate this site!</p>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="voting">
                            <button className="voteArrows" onClick={this.handleVote.bind(this, true)}>
                                <span>Truthy </span>
                                <i className="fa fa-thumbs-o-up"/>
                            </button>
                            <button className="voteArrows" onClick={this.handleVote.bind(this, false)}>
                                <span>Falsey </span>
                                <i className="fa fa-thumbs-o-down"/>
                            </button>
                            { this.state.previousVote ?
                                <p>Your previous vote: {this.state.previousVote ? "Truthy" : "Falsey"}</p>
                                :
                                <p>empty</p>
                            }
                        </div>
                    </div>
                }
            </div>
        );
    };

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
