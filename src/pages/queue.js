import React, {Component} from 'react'
import Layout from "../components/layout"
import Updatedqueue from "../components/Updatequeue"

class Queue extends Component{
  constructor(props){
    super(props);
    this.state={
        page: 'queue'
    }
  }


    render(){
      let data;
        return(
          <Layout>
            <Updatedqueue page={this.state.page} />
          </Layout>
        )
    }
}
export default Queue;
