import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import classNames from 'classnames';
import {PrivateKey, PublicKey, Signature} from "karmajs"
import Karma from "karmachain"
import logo from './logo.svg';
import './App.css';

/*
-----BEGIN KARMA SIGNED MESSAGE-----
Hello World
-----BEGIN META-----
account=scientistnik
memokey=KRM7ELYEWM3od3udgoMYWuPEKS1M1CVyNBUAENszHrB1B78XT1oWe
block=29573803
timestamp=Mon, 13 Aug 2018 09:42:32 GMT
-----BEGIN SIGNATURE-----
1f5c94592313d05a321b8b035029e47ac3b39b4423aeb726858acf5d7ff1cf750f7a6f2163d35b2af5dccd2e946bd1e52d28d8472d3757a00a9aacb026a38c5184
-----END KARMA SIGNED MESSAGE-----
*/

const SIGNED_START = "-----BEGIN KARMA SIGNED MESSAGE-----\n"
const BEGIN_META = "\n-----BEGIN META-----\n"
const BEGIN_SIGNATURE = "\n-----BEGIN SIGNATURE-----\n"
const SIGNED_END = "\n-----END KARMA SIGNED MESSAGE-----"

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 800,
  },
  menu: {
    width: 800,
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonSuccess: {
    color: 0xFFFFFF
  },
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  margin: {
    margin: theme.spacing.unit,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
});

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon
};

class App extends Component {
  state = {
    account: '',
    pass: '',
    message: '',
    signmessage: '',
    activeTag: 0,
    verification: false,
    verified: null,
    openSnackbar: false,
    snackMsg: ''
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

    let signmessage =
                SIGNED_START +
                this.state.message +
                BEGIN_META +
                `account=${this.state.account}` +
                BEGIN_SIGNATURE +
                Signature.sign(this.state.message, prv).toHex() +
                SIGNED_END

    this.setState({signmessage})
  }

  handleMessageChange = (event) => {
    this.setState({message: event.target.value})
  }

  handleChangeTag = (event, value) => {
    this.setState({ activeTag: value });
  };

  handleChangeSignmessage = (event) => {
    this.setState({
      signmessage: event.target.value,
      varified: null
    })
  }

  handleVerifySignMessage = async () => {
    this.setState({
      verification: true,
      verified: null
    })

    try {
      Karma.init();
      await Karma.connect();

      let re = new RegExp(`^${SIGNED_START}(.*)${BEGIN_META}account=(.*)${BEGIN_SIGNATURE}(\\w*)${SIGNED_END}$`)
      let [msg, account, signHex] = this.state.signmessage.replace(
        re,"$1,$2,$3"
      ).split(",")

      let signature = Signature.fromHex(signHex)
      let acc = await Karma.accounts[account]

      let verified = signature.verifyHex(
        Buffer.from(msg),
        PublicKey.fromPublicKeyString(acc.active.key_auths[0][0])
      )

      console.log("verified", verified)
      this.setState({
        verified,
        verification: false,
        openSnackbar: true,
        snackMsg: verified ? 'Successful verification' : 'Unsuccessful verification'
      })
    } catch(error) {
      console.log(error)
      this.setState({
        verification: false,
        openSnackbar: true,
        snackMsg: error.toString()
      })
    }
  }

  handleCloseSnackbar = () => {
    console.log("closeSnackbar")
    this.setState({ openSnackbar: false });
  }

  render() {
    const { classes, theme } = this.props;

    const variant = this.state.verified ? 'success' : 'error'
    const Icon = variantIcon[variant];

    console.log("openSnackbar",this.state.openSnackbar, variant)

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Kаrma Sign Message</h1>
        </header>
        <Tabs
          value={this.state.activeTag}
          onChange={this.handleChangeTag}
          centered
          fullWidth
        >
          <Tab label="Sign Message" />
          <Tab label="Verify" />
        </Tabs>
        <SwipeableViews
          index={this.state.activeTag}
          onChangeIndex={this.handleChangeTag}
         >
           <div>
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
               rows={this.state.signmessage ? 7 : 4}
               value={this.state.signmessage}
               className={classes.textField}
               margin="normal"
             />
           </div>
           <div>
             <TextField
               id="signmessage"
               label="Sign Message"
               multiline
               rows={this.state.signmessage ? 7 : 4}
               value={this.state.signmessage}
               className={classes.textField}
               onChange={this.handleChangeSignmessage}
               margin="normal"
             /><br />
             <div className={classes.wrapper}>
               <Button
                 variant="outlined"
                 onClick={this.handleVerifySignMessage}
                 disabled={this.state.verification}
                 className={classes.buttonSuccess}
               >
                 Verify Sign Message
               </Button>
               {
                 this.state.verification && <CircularProgress size={24} className={classes.buttonProgress} />
               }
             </div>
           </div>
        </SwipeableViews>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={6000}
          onClose={this.handleCloseSnackbar}
        >
          <SnackbarContent
            className={classNames(classes[variant], classes.margin)}
            aria-describedby="client-snackbar"
            message={
              <span id="client-snackbar" className={classes.message}>
                <Icon className={classNames(classes.icon, classes.iconVariant)} />
                { this.state.snackMsg }
              </span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={this.handleCloseSnackbar}
              >
                <CloseIcon className={classes.icon} />
              </IconButton>
            ]}
          />
        </Snackbar>
      </div>
    );
  }
}

export default withStyles(styles)(App);
