import React, {Component} from 'react'

class Updatequeue extends Component{
    constructor(props){
        super(props)
        this.state={
            allData: [],
            googleData: [],
            firstNames: [],
            lastNames: [],
            ticketNumbers: [],
            status: [],
            rank: [],
            tempObject: [],
            loading: false,
            changing: false
           
        }
    }

    componentDidMount(){
        this.getGoogleAPI()  
      }
 
    setOtherStates(){
        const firstName = this.state.googleData.filter(firstName => firstName.gs$cell.col === "1").filter(removed => removed.content.$t !== "firstName")
        const lastName = this.state.googleData.filter(firstName => firstName.gs$cell.col === "2").filter(removed => removed.content.$t !== "lastName")
        const ticketArray = this.state.googleData.filter(firstName => firstName.gs$cell.col === "3").filter(removed => removed.content.$t !== "ticketNumber")
        const status = this.state.googleData.filter(firstName => firstName.gs$cell.col === "4").filter(removed => removed.content.$t !== "status")
        const rank = this.state.googleData.filter(rank => rank.gs$cell.col === "5").filter(removed => removed.content.$t !== "rank")
        this.setState({
            firstNames: firstName,
            lastNames: lastName,
            ticketNumbers: ticketArray,
            status: status,
            rank: rank
            
        })
        const masterArray = [];
        for(let i=0; i<this.state.firstNames.length; i++){
            masterArray.push({
                first: this.state.firstNames[i].content.$t,
                last: this.state.lastNames[i].content.$t,
                ticket: this.state.ticketNumbers[i].content.$t,
                status: this.state.status[i].content.$t,
                rank: this.state.rank[i].content.$t
               
            })
        }
        this.setState({allData: masterArray})

    }
    getGoogleAPI(){
        fetch(' https://spreadsheets.google.com/feeds/cells/18MOKfU9x2mWVzOJcQ_OW0_4QGyHxAkvv8plV2EuO0fE/1/public/full?alt=json')
            .then( (response) => {
                return response.json()
            }).then( (json) => {
                this.setState({
                    googleData: json.feed.entry
                 })
                 this.setOtherStates()
            })
    }
    updateStatus = (ticketNumber, e) => {
        console.log('updating', ticketNumber, ' to status: ', e.target.value)
        this.setState({changing: true})
        fetch("https://sheetsu.com/apis/v1.0su/bf01d81615f1/ticketNumber/"+ticketNumber, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },  
            method: "PATCH",
            body: JSON.stringify({
                status: e.target.value,
            })
        }).then( (response) => {
            return response.json()
        }).then( (json) => {
            console.log(json);
        }).then( () => {
            this.getGoogleAPI();
            let currentlyOnDeck = this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank)
            let currentRank = parseInt(currentlyOnDeck[currentlyOnDeck.length-1].rank)
            let currentlyWaiting = this.state.allData.filter(one => one.status === "Waiting")
            for(let i = currentlyWaiting.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); 
                [currentlyWaiting[i], currentlyWaiting[j]] = [ currentlyWaiting[j],  currentlyWaiting[i]];
            }
            const nextInLine = currentlyWaiting[0];
            let totalAdded = 'updating'
            if(nextInLine){
                this.putOnDeck(nextInLine.ticket, currentRank+1, totalAdded)
            }else{
                this.setState({changing: false})
            }
           
        })
    }
    putOnDeck = (ticketNumber, rank, totalAdded) => {
        fetch("https://sheetsu.com/apis/v1.0su/bf01d81615f1/ticketNumber/"+ticketNumber, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },  
            method: "PATCH",
            body: JSON.stringify({
                status: 'On Deck',
                rank: rank
            })
        }).then( (response) => {
            return response.json()
        }).then( (json) => {
           this.state.tempObject.push(json);
            if(this.state.tempObject.length === totalAdded || totalAdded === 'updating'){
                this.getGoogleAPI()
                this.setState({loading: false})
            }    
            this.state.changing ? this.setState({changing: false}) : console.log('did it get here', this.state.changing)
        });
       
    }
    generateQueue = () => {
        this.setState({loading: true})
        let currentlyWaiting = this.state.allData.filter(one => one.status === "Waiting")
        for(let i = currentlyWaiting.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); 
            [currentlyWaiting[i], currentlyWaiting[j]] = [ currentlyWaiting[j],  currentlyWaiting[i]];
        }
        let totalAdded
        if(currentlyWaiting.length <= 15){
            totalAdded = currentlyWaiting.length;
        }else if(currentlyWaiting.length > 15){
            totalAdded = 15;
        }
        let l =0;
        while(l < currentlyWaiting.length && l < 15){
            let rank = l+1
            let needsUpdate = currentlyWaiting[l].ticket
            l++
            this.putOnDeck(needsUpdate, rank, totalAdded)
        }
    }
    addToQueue = () => {
        this.setState({loading: true})
        let currentlyWaiting = this.state.allData.filter(one => one.status === "Waiting");
        console.log('currently waiting length and object is ', currentlyWaiting.length, currentlyWaiting)
        for(let i = currentlyWaiting.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); 
            [currentlyWaiting[i], currentlyWaiting[j]] = [ currentlyWaiting[j],  currentlyWaiting[i]];
        }
        let currentlyOnDeck = this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank)
        console.log('currently OnDeck length and object is ', currentlyOnDeck.length, currentlyOnDeck)
        let currentRank = parseInt(currentlyOnDeck[currentlyOnDeck.length-1].rank)
        let totalAdded;
        if(currentlyWaiting.length + currentlyOnDeck.length > 15){
            totalAdded = 15 - currentlyOnDeck.length;
        }else{
            totalAdded = currentlyWaiting.length;
        }
        console.log('total added is ', totalAdded, 'curren rank is ', currentRank)
        let j = 0;
        while( j < currentlyWaiting.length && j + currentlyOnDeck.length < 15){
            let needsUpdate = currentlyWaiting[j].ticket
            console.log('putting this one on deck', needsUpdate, 'at rank ', currentRank+1, 'and total added is', totalAdded)

            this.putOnDeck(needsUpdate, currentRank+1, totalAdded)
            currentRank++
            j++
        }

    }
    renderData(){
        let pageView = this.props.page;
        let queueLine = this.state.allData.filter(one => one.status === "On Deck").length
        return this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank).map((each, index) => 
          <tr key={each.ticket}><td>{each.rank}</td><td>{each.ticket}</td><td>{each.status}</td>
           {queueLine >= 1 && pageView === 'editor'&&
                <td>
                <select defaultValue={"change-status"} onChange={(e) => this.updateStatus(each.ticket, e)}>
                    <option value="change-status" disabled>Change status</option>
                    <option value="Spoken">Spoken (complete)</option>
                    <option vlaue="No show">No Show</option>
                </select>
                </td>
                }
          </tr>
        )
    }
    renderSpoken(){
        return this.state.allData.filter(one => one.status === "Spoken").sort((a, b) => a.rank - b.rank).map((each, index) => 
            <tr key={each.ticket}><td>{each.rank}</td><td>{each.ticket}</td><td>{each.status}</td></tr>
        )
    }
    renderNoShow(){
        return this.state.allData.filter(one => one.status === "No Show").sort((a, b) => a.rank - b.rank).map((each, index) => 
            <tr key={each.ticket}><td>{each.rank}</td><td>{each.ticket}</td><td>{each.status}</td></tr>
        )
    }
    renderRest(){
        return this.state.allData.filter(one => one.status === "Waiting" || one.status === "Spoken" || one.status === "No Show").sort((a, b) => a.ticket - b.ticket).map((each, index) => 
            <tr key={each.ticket}><td>{each.rank}</td><td>{each.first}</td><td>{each.ticket}</td><td>{each.status}</td>
            
            </tr>
        )
    }
    render(){
        let functionCall = this.props.functionCall;
        const loading = this.state.loading;
        const changing = this.state.changing;
        let queueLine = this.state.allData.filter(one => one.status === "On Deck").length
        const numberOnDeck = this.state.allData.filter(one => one.status === "On Deck").length
        let waitingLine= this.state.allData.filter(one => one.status === "Waiting").length
        let introText;
        if(numberOnDeck < 1 && !loading && !changing){
           introText =  
            <div>
                <h3>Put first 15 on deck</h3>
                    <p>Looks like you haven't added the first 15 to the queue. Click Generate Queue button below to add the first 15 to the on-deck queue</p>
                    <input type="submit" onClick={this.generateQueue} value={loading ? 'Loading...' : 'Generate Queue'}></input>  
            </div>
        }else if(numberOnDeck >= 1 && numberOnDeck <15 && !loading && !changing && waitingLine > 0){
            introText =
                    <div>
                        <h3>Add to your queue</h3>
                        <p>Looks like your queue is less than 15. Click button below to add to the current queue.</p>
                        <input type="submit" onClick={this.addToQueue} value={loading ? 'Loading...' : 'Add to Queue'}></input>
                    </div>
        }else if(numberOnDeck >= 1 && numberOnDeck <15 && !loading && !changing && waitingLine === 0){
            introText =
                    <div>
                        <p>You've set your initial queue and no one is currenlty waiting to join the on-deck pool</p>
                        <p>Change the status of the 'on-deck' tickets below to add next in line to the queue</p>
                    </div>
        }else{
            introText =
            <div>
                <p>You've set your initial queue</p>
                <p>Change the status of the 'on-deck' tickets below to add next in line to the queue</p>
            </div>
        }
        let pageView = this.props.page;
        let tableSection;
        pageView === 'queue' ? 
            tableSection = <div> <h3>On Deck to Comment</h3>
            <div className="row">
              <div className="col-md-8">
              {queueLine === 0 &&
                <p>Nothing added to the queue yet!</p>
             }
              <table className="queue-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Ticketnumber</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {this.renderData()}
                  </tbody>
                </table>
              </div>
              <div className="col-md-4">
                <h4>Please help us accommodate as many people tonight as possible:​</h4>
                  <ul>
                    <li>Up to two minutes per speaker ​</li>
                    <li>One turn at the mic​</li>
                    <li>Clapping/cheering slows us down – please raise your hand instead​</li>
                    <li>We are not audio-recording​</li>
                  </ul>
                <p className="queue-highlight"><strong>Don’t miss your turn! </strong>Please be seated in one of our five “waiting” chairs as your turn approaches.​</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-8">
                <h3>Complete</h3>
                <table className="other-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Ticketnumber</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {this.renderSpoken()}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row">
              <div className="col-md-8">
                <h3>No Show</h3>
                <table className="other-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Ticketnumber</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {this.renderNoShow()}
                  </tbody>
                </table>
              </div>
            </div></div>
       :
            tableSection = <div className={loading ? 'load-data' : 'main-table-form'}>{introText}
            <h2>On Deck</h2>
            {changing === true &&
                 <p><strong>Updating Queue...</strong></p>
            }
            {queueLine === 0 && !loading &&
                <p>Nothing added to the queue yet!</p>
             }
             {loading === true &&
                 <p><strong>Loading Queue...</strong></p>
            }
            <table className={changing ? 'updating-status' : 'editor-table'}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Ticketnumber</th>
                        <th>Status</th>
                        {queueLine >= 1 &&
                            <th>Update</th>
                        }
                    </tr>
                 </thead>
                <tbody>
                    {this.renderData()}
                </tbody>
            </table>
            <h2>Waiting and Complete</h2>
            <table>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Name</th>
                        <th>Ticketnumber</th>
                        <th>Status</th>
                    </tr>
                 </thead>
                <tbody>
                    {this.renderRest()}
                </tbody>
            </table></div>
        
        return(
            <div>{tableSection}</div>
        )
    }
}
export default Updatequeue;