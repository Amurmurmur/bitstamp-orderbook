import React from "react";
// import logo from "./logo.svg";
import "./App.css";
// import { OrderBook, TradeHistory } from "react-trading-ui";
import { fetchInstruments } from "./api";

/**
 * Material-ui
 */
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
// import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
// import Fade from "@material-ui/core/Fade";
// import io from 'socket.io-client';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { w3cwebsocket as W3CWebSocket } from "websocket";

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit
  },
  formControl: {
    margin: theme.spacing.unit,
    padding: 4,
    display: "flex",
    // alignItems: 'center',
    // justifyContent: 'center',
    flexGrow: 1
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  mainGrid: {
    margin: theme.spacing.unit
  },
  progress: {
    margin: theme.spacing.unit * 2
  },
  loadingGridContainer: {
    minHeight: "100vh"
  }
});

const client = new W3CWebSocket("wss://ws.bitstamp.net");

class App extends React.Component {
  state = {
    instruments: [],
    selectedInstrument: "btcusd",
    bids: null,
    asks: null,
    instrumentsFetching: false
  };

  initWebsocket = () => {
    const { selectedInstrument } = this.state;
    client.onopen = () => {
      // console.log("WebSocket Client Connected");
      toast.success(`Successfully connected to Bitstamp`, { autoClose: 3000 });
      client.send(
        JSON.stringify({
          event: "bts:subscribe",
          data: {
            channel: `[order_book_${selectedInstrument}]`
          }
        })
      );
    };

    client.onmessage = evt => {
      const response = JSON.parse(evt.data);
      switch (response.event) {
        default:
          console.log(JSON.stringify(response));
          break;
        case "bts:subscription_succeeded":
          toast.success(`Successfully subscribed to ${selectedInstrument}`, {
            autoClose: 5000
          });
          break;
        case "data":
          // console.log("DATA: " + response.data.bids[0][1]);
          this.setState({ bids: response.data.bids, asks: response.data.asks });
          break;
        case "bts:request_reconnect":
          this.initWebsocket();
          break;
      }
    };

    client.onclose = () => {
      toast.error("Websocket connection closed", { autoClose: 5000 });
      this.initWebsocket();
    };
  };

  subscribeToChannel = () => {
    const { selectedInstrument } = this.state;
    client.send(
      JSON.stringify({
        event: "bts:subscribe",
        data: {
          channel: `[order_book_${selectedInstrument}]`
        }
      })
    );
  };

  ubsubscribeFromChannel = () => {
    const { selectedInstrument } = this.state;
    client.send(
      JSON.stringify({
        event: "bts:unsubscribe",
        data: {
          channel: `[order_book_${selectedInstrument}]`
        }
      })
    );
  };

  componentDidMount() {
    // this.setState({ instrumentsFetching: true });
    fetchInstruments().then(response =>
      this.setState({ instruments: response, instrumentsFetching: false })
    );

    this.initWebsocket()
  }

  // serializeData = (data) => {
  //   bidsPlaceholder.innerHTML = '';
  //   asksPlaceholder.innerHTML = '';
  //   for (i = 0; i < data.bids.length; i++) {
  //       bidsPlaceholder.innerHTML = bidsPlaceholder.innerHTML + data.bids[i][1] + ' BTC @ ' + data.bids[i][0] + ' USD' + '<br />';
  //   }
  //   for (i = 0; i < data.asks.length; i++) {
  //       asksPlaceholder.innerHTML = asksPlaceholder.innerHTML + data.asks[i][1] + ' BTC @ ' + data.asks[i][0] + ' USD' + '<br />';
  //   }
  // }

  handleChange = event => {
    const {
      target: { value }
    } = event;
    const { selectedInstrument } = this.state;
    if (value !== selectedInstrument) {
      this.ubsubscribeFromChannel();
      this.setState({ selectedInstrument: value }, () => {
        this.subscribeToChannel();
      });
    }
  };

  render() {
    const {
      instruments,
      selectedInstrument,
      instrumentsFetching,
      bids,
      asks
    } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid alignItems={"flex-start"} direction="row" container spacing={24}>
          <Grid item xs={6} lg={2}>
            <Paper className={classes.paper}>
              {instrumentsFetching && (
                <CircularProgress className={classes.progress} />
              )}

              {!instrumentsFetching && (
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="instrument-type">
                    Instrument type
                  </InputLabel>
                  <Select
                    value={selectedInstrument}
                    onChange={this.handleChange}
                    inputProps={{
                      name: "instrument",
                      id: "instrument-type"
                    }}
                  >
                    {instruments.map((instrument, index) => {
                      return (
                        <MenuItem
                          key={instrument.url_symbol}
                          value={instrument.url_symbol}
                        >
                          {instrument.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            </Paper>
          </Grid>
          <Grid item xs={6} lg={10}>
            <Paper className={classes.paper}>
              <Grid container direction="row" spacing={24}>
                <Grid item xs={6}>
                  {bids &&
                    bids.map((bid, index) => (
                      <List dense key={index} className={classes.root}>
                        <ListItemText primary={`${bid[0]}`} />
                      </List>
                    ))}
                </Grid>
                <Grid item xs={6}>
                  {asks &&
                    asks.map((ask, index) => (
                      <List dense key={index} className={classes.root}>
                        <ListItemText primary={`${ask[0]}`} />
                      </List>
                    ))}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <ToastContainer />
      </div>
    );
  }
}

export default withStyles(styles)(App);
