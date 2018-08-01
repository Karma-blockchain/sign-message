import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {PrivateKey, Signature} from "karmajs"
import logo from './logo.svg';
import './App.css';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 500,
  },
  menu: {
    width: 500,
  },
});

class App extends Component {
  state = {
    account: '',
    pass: '',
    message: '',
    signmessage: ''
  }

  handleAccChange = (event) => {
    this.setState({account: event.target.value})
  }

  handlePassChange = (event) => {
    this.setState({pass: event.target.value})
  }

  handleSignMessage = () => {
    let prv = PrivateKey.fromSeed(`${this.state.account}active${this.state.pass}`)
    console.log(prv.toWif())
    this.setState({signmessage: `{message: "${this.state.message}", signature: "${Signature.sign(this.state.message, prv).toHex()}"}`})
  }

  handleMessageChange = (event) => {
    this.setState({message: event.target.value})
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Krama Sign Message</h1>
        </header>
        <TextField
          id="name"
          label="Account"
          className={classes.textField}
          value={this.state.account}
          onChange={this.handleAccChange}
          margin="normal"
        /><br/>
        <TextField
          id="password"
          label="Password"
          type="password"
          className={classes.textField}
          value={this.state.pass}
          onChange={this.handlePassChange}
          margin="normal"
        /><br/>
        <TextField
          id="message"
          label="Message"
          multiline
          rows="4"
          value={this.state.message}
          onChange={this.handleMessageChange}
          className={classes.textField}
          margin="normal"
        /><br/>
        <Button
          variant="outlined"
          onClick={this.handleSignMessage}
        >
          Sign message
        </Button><br/>
        <TextField
          id="signmessage"
          label="Sign Message"
          multiline
          rows="4"
          value={this.state.signmessage}
          className={classes.textField}
          margin="normal"
        />
      </div>
    );
  }
}

export default withStyles(styles)(App);
