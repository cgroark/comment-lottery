import React, {Component} from 'react'
import Layout from "../components/layout"
import Updatedqueue from "../components/Updatequeue"



class Editor extends Component{
    constructor(props){
        super(props)
        this.state={
            page: 'editor',
        }
    }
   
    render(){
            return(
                <Layout>  
                     <Updatedqueue page={this.state.page} />
                </Layout>  
            )
    }
}

export default Editor;