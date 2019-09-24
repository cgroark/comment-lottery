import React, {Component} from 'react'
import Layout from "../components/layout"
import Form from "../components/form"


class MainWrapper extends Component{
    
    render(){
        return(
            <Layout>
                   <h3>Enter ticket number</h3>
                    <Form />
            </Layout>
        )
    }
}
export default MainWrapper;