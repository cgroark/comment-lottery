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
    this.setState({allData: masterArray.sort((a, b) => a.ticket - b.ticket).filter(one => one.status === "On Deck")})
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
    return this.state.allData.sort((a, b) => a.rank - b.rank).map((each, index) => 
      <tr key={each.ticket}><td>{each.rank}</td><td>{each.first}</td><td>{each.ticket}</td><td>{each.status}</td></tr>
    )
  }
    render(){
        return(
          <Layout>
          <h3>On Deck to Comment</h3>
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
        </Layout>
        )
    }
}
export default Queue;
