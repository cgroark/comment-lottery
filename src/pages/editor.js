import React, {Component} from 'react'
import Layout from "../components/layout"

class Editor extends Component{
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
            loading: false
           
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
        for(var i=0; i<this.state.firstNames.length; i++){
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
        console.log('updating ', ticketNumber, ' to ', e.target.value)
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
            var currentlyOnDeck = this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank)
            var currentRank = parseInt(currentlyOnDeck[currentlyOnDeck.length-1].rank)
            console.log('current rank in update status is ', currentRank )
            var currentlyWaiting = this.state.allData.filter(one => one.status === "Waiting")
            for(var i = currentlyWaiting.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); 
                [currentlyWaiting[i], currentlyWaiting[j]] = [ currentlyWaiting[j],  currentlyWaiting[i]];
            }
            const nextInLine = currentlyWaiting[0];
            console.log(nextInLine, ' is nexxt in line');
            if(nextInLine){
                console.log('next in line is ', nextInLine)
                this.putOnDeck(nextInLine.ticket, currentRank+1)
            }
           
        })
    }
   
    renderData(){
        var queueLine = this.state.allData.filter(one => one.status === "On Deck").length
        return this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank).map((each, index) => 
            <tr key={each.ticket}><td>{each.rank}</td><td>{each.first}</td><td>{each.ticket}</td><td>{each.status}</td>
                {queueLine >= 1 &&
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
    renderRest(){
        console.log('rest',this.state.allData)
        return this.state.allData.filter(one => one.status === "Waiting" || one.status === "Spoken" || one.status === "No Show").sort((a, b) => a.ticket - b.ticket).map((each, index) => 
            <tr key={each.ticket}><td>{each.rank}</td><td>{each.first}</td><td>{each.ticket}</td><td>{each.status}</td>
            
            </tr>
        )
    }
    putOnDeck = (ticketNumber, rank, i) => {
        this.setState({loading: true})
        console.log(this.state.loading, 'before fetch')
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
               this.getGoogleAPI()
        });
       
    }
    generateQueue = () => {
        var currentlyWaiting = this.state.allData.filter(one => one.status === "Waiting")
        for(var i = currentlyWaiting.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); 
            [currentlyWaiting[i], currentlyWaiting[j]] = [ currentlyWaiting[j],  currentlyWaiting[i]];
        }
        console.log('number waiting', currentlyWaiting.length)
        var totalAdded
        if(currentlyWaiting.length == 15){
            totalAdded = 15;
        }else{
            totalAdded = currentlyWaiting.length;
        }
        console.log('total added is', totalAdded)
        var l =0;
        while(l < currentlyWaiting.length && l < 15){
            var rank = l+1
            var needsUpdate = currentlyWaiting[l].ticket
            l++
            this.putOnDeck(needsUpdate, rank, i)
        }
    }
    addToQueue = () => {
        var currentlyWaiting = this.state.allData.filter(one => one.status === "Waiting")
        for(var i = currentlyWaiting.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); 
            [currentlyWaiting[i], currentlyWaiting[j]] = [ currentlyWaiting[j],  currentlyWaiting[i]];
        }
        var currentlyOnDeck = this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank)
        var currentRank = parseInt(currentlyOnDeck[currentlyOnDeck.length-1].rank)
        console.log('current rank is ', currentRank)
        var j = 0;
        while( j < currentlyWaiting.length && currentRank < 15){
            console.log(currentRank)
            var needsUpdate = currentlyWaiting[j].ticket
            this.putOnDeck(needsUpdate, currentRank+1)
            console.log('putting ', needsUpdate, ' on deck at rank ', currentRank+1)
            currentRank++
            j++
        }

    }
    render(){
        var queueLine = this.state.allData.filter(one => one.status === "On Deck").length
        const numberOnDeck = this.state.allData.filter(one => one.status === "On Deck").length
        if(numberOnDeck < 1){
            return(
                <Layout>  
                    <div>
                        <h3>Put first 15 on deck</h3>
                         <p>Looks like you haven't added the first 15 to the queue. Click Generate Queue button below to add the first 15 to the on-deck queue</p>
                            <button  onClick={this.generateQueue}>Generate Queue</button>  
                    </div>
                    <h2>On Deck</h2>
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
                    </table>
                </Layout>  
            )
        }else if(numberOnDeck >= 1 && numberOnDeck <15){
            return(
                <Layout>
                    <div>
                        <h3>Add to your queue</h3>
                        <p>Looks like your queue is less than 15. Click button below to add to the current queue.</p>
                        <button  onClick={this.addToQueue}>Add to Queue</button>
                    </div>
                    <h2>On Deck</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Name</th>
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
                    </table>
                </Layout>
            )
        }else{
            return(
                <Layout>
                    <div>
                        <p>You've set your initial queue</p>
                        <p>Change the status of the 'on-deck' tickets below to add next in line to the queue</p>
                    </div>
                    <h2>On Deck</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Name</th>
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
                    </table>
                </Layout>
            )
        }
    }
}

export default Editor;