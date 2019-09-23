import React, {Component} from 'react'

class Form extends Component{
    constructor(props){
        super(props);
        this.state={
            firstName: '',
            lastName: '',
            ticketNumber: '',
            submitting: false
        }

    }
    
    handleChange = e => this.setState({
        [e.target.name]: e.target.value
    })
    handleSubmit = event => {
        const dataSend = {
            firstName: this.state.firstName,
            lastName: this.state.lastName,

            ticketNumber: this.state.ticketNumber,
            status: 'Waiting',
            rank: 'unset'
        }
        event.preventDefault()
        this.setState({
            submitting: true,
            firstName: '',
            lastName: '',
            ticketNumber: '',
        })
        console.log('before fetch', this.state.submitting)
        fetch('https://sheetsu.com/apis/v1.0su/bf01d81615f1', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(dataSend)
        }).then( (response) => {
            this.setState({
                submitting: false
            })
            return response.json()
        }).then((json) => {
        });
      }
    render(){
        const { firstName, lastName, ticketNumber } = this.state;
        const submitting = this.state.submitting;
        return(
            <form onSubmit={this.handleSubmit} className={submitting ? 'loading' : 'submit-form'}>
                    <p>
                        <label >First Name<br />
                        <input type="text" name='firstName' value={firstName} onChange={this.handleChange} />
                         </label>
                    </p>
                    <p>
                        <label >Last name<br />
                            <input type="text" name='lastName' value={lastName} onChange={this.handleChange} /> 
                        </label>
                    </p>
                    <p>
                        <label>Ticket Number<br />
                            <input type="number" name="ticketNumber" value={ticketNumber}  onChange={this.handleChange} />
                        </label>
                    </p>
                    <input type='submit' disabled={submitting} value={submitting ? 'Loading...' : 'Submit'}></input>
                </form>
        )
    }
}


export default Form;