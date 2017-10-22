import ReactDOM from 'react-dom';
import React, {Component} from 'react';

class App extends Component {

    state = {
        currentUrl: null,
        vote: null
    };

    componentDidMount = () => {

        //identify current page
        chrome.tabs.query({
            'active': true,
            'lastFocusedWindow': true
        }, (tabs) => {
            const url = tabs[0].url;
            this.setState({
                currentUrl: url
            });
            // retrieve vote history from server
            fetch('http://localhost:4800/votes?url=' + url).then((response) => {
                return response.json();
            }).then( (obj) => {
                this.setState({
                    vote: (obj.score * 100).toFixed(2)
                });
            })
        });
    };

    handleUpvote = () => {
        this.setState({
            vote: 1
        }, console.log('upvoted'));
        // TODO: replace callback with call to server to log vote
        // TODO: if no votes yet, encourage votes
        // TODO: handle diff URLs for same page, root domain instead of full root and path

    };

    handleDownvote = () => {
        this.setState({
            vote: 0
        }, console.log('downvoted'));
    };

    render() {
        return (
            <div className="App">
                <div className="intro">
                    <div className="intro-icon">
                        <i className="fa fa-tachometer fa-5x"/>
                    </div>
                    <div className="intro-copy">
                        <h2>Is this page truthy or falsey?</h2>
                        <p className="urlName">{this.state.currentUrl}</p>
                        <p>Truthiness: {this.state.vote}%</p>
                    </div>
                </div>
                <div className="voting">
                    <button className="voteArrows" onClick={this.handleUpvote.bind(this)}>Truthy &#x25B2;</button><br />
                    <button className="voteArrows" onClick={this.handleDownvote.bind(this)}>Falsey &#x25BC;</button>
                </div>

            </div>
        );
    }

}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
