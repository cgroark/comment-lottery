import React, {Component} from 'react'
import Layout from "../components/layout"
import { ECONNABORTED } from 'constants'


class Queue extends Component{
  constructor(props){
    super(props)
    this.state={
        allData: [],
        googleData: [],
        firstNames: [],
        lastNames: [],
        ticketNumbers: [],
        status: [],
        rank: []
    }
}
componentDidMount(){
    this.getGoogleAPI()
  }
  
setOtherStates(){
    console.log('reached')
    const firstName = this.state.googleData.filter(firstName => firstName.gs$cell.col === "1").filter(removed => removed.content.$t !== "firstName")
    const lastName = this.state.googleData.filter(lastName => lastName.gs$cell.col === "2").filter(removed => removed.content.$t !== "lastName")
    const ticketArray = this.state.googleData.filter(ticket => ticket.gs$cell.col === "3").filter(removed => removed.content.$t !== "ticketNumber")
    const status = this.state.googleData.filter(status => status.gs$cell.col === "4").filter(removed => removed.content.$t !== "status")
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
    console.log(this.state.allData)

}
getGoogleAPI(){
    fetch('https://spreadsheets.google.com/feeds/cells/18MOKfU9x2mWVzOJcQ_OW0_4QGyHxAkvv8plV2EuO0fE/1/public/full?alt=json')
        .then( (response) => {
            return response.json()
        }).then( (json) => {
            this.setState({
                googleData: json.feed.entry
             })
             this.setOtherStates()
        })
}
renderData(){
  console.log('filtered', this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank))
  return this.state.allData.filter(one => one.status === "On Deck").sort((a, b) => a.rank - b.rank).map((each, index) => 
    <tr key={each.ticket}><td>{each.rank}</td><td>{each.ticket}</td><td>{each.status}</td></tr>
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

    render(){
        return(
          <Layout>
          <h3>On Deck to Comment</h3>
          <div className="row">
            <div className="col-md-8">
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
              <p><strong>Don’t miss your turn! </strong>Please be seated in one of our five “waiting” chairs as your turn approaches.​</p>
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
          </div>
        </Layout>
        )
    }
}
export default Queue;
