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

import { AutoSizer, Column, Table } from 'react-virtualized';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { w3cwebsocket as W3CWebSocket } from "websocket";
/**
 * Bitnami websocket client
 */
const client = new W3CWebSocket("wss://ws.bitstamp.net");
const intital_order_book_subscription_payload = {
  event: "bts:subscribe",
  data: {
    channel: `order_book_btcusd`
  }
};

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
  },
  list: {
    height: 120,
    flex: 'wrap'
  }
});

class App extends React.Component {
  state = {
    instruments: [],
    selectedInstrument: "btcusd",
    bids: null,
    asks: null,
    instrumentsFetching: false
  };

  initWebsocket = () => {
    client.onopen = () => {
      // console.log("WebSocket Client Connected");
      toast.success(`Successfully connected to Bitstamp`, { autoClose: 3000 });
      client.send(JSON.stringify(intital_order_book_subscription_payload));
    };

    client.onmessage = evt => {
      const response = JSON.parse(evt.data);
      // console.log(evt);
      switch (response.event) {
        case "bts:unsubscription_succeeded":
          // console.log(response);
          break;
        case "bts:subscription_succeeded":
          // console.log(response);
          break;
        case "data":
          // console.log("DATA: " + JSON.stringify(response));
          this.setState({ bids: response.data.bids, asks: response.data.asks });
          break;
        case "bts:request_reconnect":
          this.initWebsocket();
          break;
        default:
          console.log(JSON.stringify(response));
          break;
      }
    };

    client.onerror = evt => {
      toast.error("Websocket error " + JSON.stringify(evt), {
        autoClose: 5000
      });
    };

    client.onclose = () => {
      toast.info("Websocket connection closed", { autoClose: 5000 });
      // this.initWebsocket();
    };
  };

  subscribeToChannel = instrument => {
    client.send(
      JSON.stringify({
        event: "bts:subscribe",
        data: {
          channel: `order_book_${instrument}`
        }
      })
    );
  };

  ubsubscribeFromChannel = instrument => {
    client.send(
      JSON.stringify({
        event: "bts:unsubscribe",
        data: {
          channel: `order_book_${instrument}`
        }
      })
    );
  };

  componentDidMount() {
    this.setState({ instrumentsFetching: true });
    fetchInstruments().then(response =>
      this.setState({ instruments: response, instrumentsFetching: false })
    );
    this.initWebsocket();
  }

  handleChange = event => {
    const {
      target: { value }
    } = event;
    const { selectedInstrument } = this.state;
    if (value !== selectedInstrument) {
      this.ubsubscribeFromChannel(selectedInstrument);
      this.setState({ selectedInstrument: value }, () => {
        this.subscribeToChannel(value);
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
                  <List dense className={classes.list}>
                    {bids &&
                      bids.map((bid, index) => (
                        <ListItemText
                          key={index}
                          primary={`${bid[1]} BTC @ ${bid[0]} USD`}
                        />
                      ))}
                  </List>
                </Grid>
                <Grid item xs={6}>
                  <List dense className={classes.list}>
                    {asks &&
                      asks.map((ask, index) => (
                        <ListItemText
                          key={index}
                          primary={`${ask[1]} BTC @ ${ask[0]} USD`}
                        />
                      ))}
                  </List>
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
