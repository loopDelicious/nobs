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

        console.log(this.state.previousVote);
        console.log(this.state.voteHistory);

        // identify the current page
        chrome.tabs.query({
            'active': true,
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
                    console.log(this.state.voteHistory);
                });

                // retrieve the previous vote from server
                fetch('http://localhost:4800/vote?url=' + url).then((response) => {
                    // console.log(response);
                    return response.json();
                }).then((obj2) => {
                    // console.log(obj2);
                    this.setState({
                        previousVote: (obj2.error ? null : obj2.vote)
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
            console.log(response);
            return response.json();
        }).then((obj) => {
            console.log(obj);
            this.setState({
                previousVote: (obj ? obj.data.vote : null)
            });
        });
    };

    // TODO: false votes are returned as 1 from server and therefore 100% truthy
    // TODO: persist display in pop-up for first time votes
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
                            <div className="intro-spacer">&nbsp;</div>
                            <div className="intro-cta">
                                <h2>Is this page truthy or falsey?</h2>
                                <p className="urlName">{this.state.currentUrl}</p>
                                { this.state.voteHistory ?
                                    <div className="previous-votes">
                                        { this.state.voteHistory > .50 ?
                                            <img className="speedometer" src="/public/img/hi.png" alt="high-vote"/>
                                            : (this.state.voteHistory > .20 ?
                                                <img className="speedometer" src="/public/img/med.png" alt="med-vote"/>
                                                :
                                                <img className="speedometer" src="/public/img/lo.png" alt="low-vote"/>)
                                        }
                                        <p className="truthy-level">Truthiness-level: {this.state.voteHistory}%</p>

                                    </div>
                                    :
                                    <div className="no-votes-yet">
                                        <img className="speedometer" src="/public/img/noVotes.png" alt="no-votes-yet"/>
                                        <p>Be one of the first to rate this site!</p>
                                    </div>

                                }
                            </div>
                        </div>
                        <div className="voting">
                            <button
                                className={'voteArrows ' + (this.state.previousVote !== null ? (this.state.previousVote ? 'vote-selected' : '') : '')}
                                onClick={this.handleVote.bind(this, true)}>
                                <span>Truthy </span>
                                <i className="fa fa-thumbs-o-up"/>
                            </button>
                            <button
                                className={'voteArrows ' + (this.state.previousVote !== null ? (this.state.previousVote ? '' : 'vote-selected') : '')}
                                onClick={this.handleVote.bind(this, false)}>
                                <span>Falsey </span>
                                <i className="fa fa-thumbs-o-down"/>
                            </button>
                        </div>
                    </div>
                }
            </div>
        );
    };

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
