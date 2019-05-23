import React from "react";
import { fetchInstruments } from "./api";

/**
 * Material-ui
 */
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { w3cwebsocket as W3CWebSocket } from "websocket";

/**
 * Dates lib
 */
import moment from 'moment';

/**
 * Bitnami websocket client
 */
const client = new W3CWebSocket("wss://ws.bitstamp.net");
const priceClient = new W3CWebSocket("wss://ws.bitstamp.net");

const intital_order_book_subscription_payload = {
  event: "bts:subscribe",
  data: {
    channel: `order_book_btcusd`
  }
};

const intital_ticker_subscription_payload = {
  event: "bts:subscribe",
  data: {
    channel: `live_trades_btcusd`
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
    overflow: "auto",
    minHeight: 250,
    maxHeight: 250
  },
  tradeHistoryList: {
    overflow: "auto",
    minHeight: 532,
    maxHeight: 532
  },
  bidText: {
    color: "red"
  },
  askText: {
    color: "green"
  },
  footer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    marginTop: theme.spacing.unit * 2,
    justifyContent: 'center'
  }
});

class App extends React.Component {
  state = {
    instruments: [],
    selectedInstrument: "btcusd",
    selectedInstrumentCoin: "BTC",
    selectedInstrumentCurrency: "USD",
    bids: null,
    asks: null,
    ticker: { price_str: "..." },
    trades: [],
    instrumentsFetching: false
  };

  initWebsocket = () => {
    client.onopen = () => {
      toast.success(`Successfully connected to Bitstamp`, { autoClose: 3000 });
      client.send(JSON.stringify(intital_order_book_subscription_payload));
    };

    client.onmessage = evt => {
      const response = JSON.parse(evt.data);
      switch (response.event) {
        case "bts:unsubscription_succeeded":
          break;
        case "bts:subscription_succeeded":
          break;
        case "data":
          this.setState({ bids: response.data.bids, asks: response.data.asks });
          break;
        case "bts:request_reconnect":
          this.initWebsocket();
          break;
        default:
          break;
      }
    };

    client.onerror = evt =>
      toast.error("Websocket error " + JSON.stringify(evt), {
        autoClose: 5000
      });

    client.onclose = () =>
      toast.info("Websocket connection closed", { autoClose: 5000 });
  };

  initPriceWebsocket = () => {
    priceClient.onopen = () => {
      priceClient.send(JSON.stringify(intital_ticker_subscription_payload));
    };

    priceClient.onmessage = evt => {
      const response = JSON.parse(evt.data);
      switch (response.event) {
        case "trade":
          const trades = this.state.trades;
          if (trades.length > 30) {
            trades.pop();
          }
          this.setState({
            ticker: response.data,
            trades: [response.data, ...trades]
          });
          break;
        case "bts:request_reconnect":
          this.initPriceWebsocket();
          break;
        default:
          break;
      }
    };

    priceClient.onerror = evt =>
      toast.error("Websocket error " + JSON.stringify(evt), {
        autoClose: 5000
      });

    priceClient.onclose = () =>
      toast.info("Websocket connection closed", { autoClose: 5000 });
  };

  subscribeToChannel = (channel, instrument) =>
    client.send(
      JSON.stringify({
        event: "bts:subscribe",
        data: {
          channel: `order_book_${instrument}`
        }
      })
    );

  ubsubscribeFromChannel = instrument =>
    client.send(
      JSON.stringify({
        event: "bts:unsubscribe",
        data: {
          channel: `order_book_${instrument}`
        }
      })
    );

  subscribeToTradesChannel = instrument =>
    priceClient.send(
      JSON.stringify({
        event: "bts:subscribe",
        data: {
          channel: `live_trades_${instrument}`
        }
      })
    );

  ubsubscribeFromTradesChannel = instrument =>
    priceClient.send(
      JSON.stringify({
        event: "bts:unsubscribe",
        data: {
          channel: `live_trades_${instrument}`
        }
      })
    );

  componentDidMount() {
    this.setState({ instrumentsFetching: true });
    fetchInstruments().then(response =>
      this.setState({ instruments: response, instrumentsFetching: false })
    );
    this.initWebsocket();
    this.initPriceWebsocket();
  }

  handleChange = event => {
    const {
      target: { value }
    } = event;
    const { selectedInstrument } = this.state;
    if (value !== selectedInstrument) {
      this.ubsubscribeFromChannel(selectedInstrument);
      this.ubsubscribeFromTradesChannel(selectedInstrument);
      const instrument = this.getInstrument(value);
      const selectedInstrumentCoin = instrument.name.split("/")[0];
      const selectedInstrumentCurrency = instrument.name.split("/")[1];
      this.setState(
        {
          selectedInstrument: value,
          selectedInstrumentCoin,
          selectedInstrumentCurrency,
          ticker: { price_str: "..." },
          trades: []
        },
        () => {
          this.subscribeToChannel(value);
          this.subscribeToTradesChannel(value);
        }
      );
    }
  };

  getInstrument = url_symbol => {
    return this.state.instruments.find(
      (item, index) => item.url_symbol === url_symbol
    );
  };

  render() {
    const {
      instruments,
      selectedInstrument,
      instrumentsFetching,
      bids,
      asks,
      ticker,
      trades,
      selectedInstrumentCoin,
      selectedInstrumentCurrency
    } = this.state;
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid alignItems={"flex-start"} direction="row" container spacing={8}>
          <Grid item xs={12} sm={4} md={4} lg={2}>
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
          <Grid item xs={12} sm={4} md={4} lg={5}>
            <Paper className={classes.paper}>
              <Grid container direction="column" spacing={24}>
                <Grid item xs={12}>
                  <List dense className={classes.list}>
                    {bids &&
                      bids.map((bid, index) => (
                        <div key={`${index}`}>
                          <ListItem>
                            <ListItemText
                              disableTypography
                              primary={
                                <Typography
                                  variant="body1"
                                  style={{ color: "red" }}
                                >{`${
                                  bid[1]
                                } ${selectedInstrumentCoin}`}</Typography>
                              }
                            />
                            <ListItemText
                              disableTypography
                              primary={
                                <Typography
                                  variant="body1"
                                  style={{ color: "red" }}
                                >{`${
                                  bid[0]
                                } ${selectedInstrumentCurrency}`}</Typography>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </div>
                      ))}
                  </List>
                </Grid>
                <Typography variant="h6">{ticker.price_str}</Typography>
                <Grid item xs={12}>
                  <List dense className={classes.list}>
                    {asks &&
                      asks.map((ask, index) => (
                        <div key={`${index}`}>
                          <ListItem>
                            <ListItemText
                              disableTypography
                              primary={
                                <Typography
                                  variant="body1"
                                  style={{ color: "green" }}
                                >{`${
                                  ask[1]
                                } ${selectedInstrumentCoin}`}</Typography>
                              }
                            />
                            <ListItemText
                              disableTypography
                              primary={
                                <Typography
                                  variant="body1"
                                  style={{ color: "green" }}
                                >{`${
                                  ask[0]
                                } ${selectedInstrumentCurrency}`}</Typography>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </div>
                      ))}
                  </List>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4} md={4} lg={5}>
            <Paper className={classes.paper}>
              <Typography variant="h6">Trade history</Typography>
              <List dense className={classes.tradeHistoryList}>
                {trades &&
                  trades.length > 0 &&
                  trades.map((trade, index) => (
                    <div key={`${index}`}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              style={{
                                color: trade.type === 0 ? "green" : "red"
                              }}
                            >{`${trade.amount_str}`}</Typography>
                          }
                        />
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              style={{
                                color: trade.type === 0 ? "green" : "red"
                              }}
                            >{`${trade.price_str}`}</Typography>
                          }
                        />
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              style={{
                                color: trade.type === 0 ? "green" : "red"
                              }}
                            >{`${moment.unix(trade.timestamp).format('HH:mm:ss')}`}</Typography>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
        <div className={classes.footer}>
          <Typography variant="body1">Made with ❤️ by Amur Anzorov</Typography>
        </div>
        <ToastContainer />
      </div>
    );
  }
}

export default withStyles(styles)(App);
