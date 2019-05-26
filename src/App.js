import React from "react";

/**
 * Redux
 */
import { connect } from "react-redux";
import { compose } from "redux";
import { createStructuredSelector } from "reselect";
import {
  makeSelectInstruments,
  makeSelectInstrumentsFetching,
  makeSelectInstrument,
  makeSelectTrades,
  makeSelectOrderBook,
  makeSelectTicker,
  makeSelectNotifications
} from "./selectors/";
import { fetchInstrumentsRequest } from "./redux/reducers/instruments/actions";
import {
  subscribeToChannel,
  unsubscribeFromChannel
} from "./redux/reducers/bitstampclient/actions";

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

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import Notifications from "react-notification-system-redux";

/**
 * Dates lib
 */
import moment from "moment";

/**
 * Misc
 */
import { getInstrument } from "./utils/helpers";

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
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    marginTop: theme.spacing.unit * 2,
    justifyContent: "center"
  }
});

class App extends React.Component {
  state = {
    selectedInstrument: "btcusd",
    selectedInstrumentCoin: "BTC",
    selectedInstrumentCurrency: "USD"
  };

  componentDidMount() {
    this.props.fetchInstruments();
  }

  handleChange = event => {
    const {
      target: { value }
    } = event;
    const { selectedInstrument } = this.state;
    const { subscribe, unsubscribe, instruments } = this.props;
    if (value !== selectedInstrument) {
      unsubscribe("order_book", selectedInstrument);
      unsubscribe("live_trades", selectedInstrument);
      const instrument = getInstrument(instruments, value);
      const selectedInstrumentCoin = instrument.name.split("/")[0];
      const selectedInstrumentCurrency = instrument.name.split("/")[1];
      this.setState({
        selectedInstrument: value,
        selectedInstrumentCoin,
        selectedInstrumentCurrency
      });
      subscribe("order_book", value);
      subscribe("live_trades", value);
    }
  };

  render() {
    const {
      selectedInstrument,
      selectedInstrumentCoin,
      selectedInstrumentCurrency
    } = this.state;
    const {
      classes,
      instruments,
      instrumentsFetching,
      orderBook,
      trades,
      ticker,
      notifications
    } = this.props;
    return (
      <div className={classes.root}>
        <Grid alignItems={"flex-start"} direction="row" container spacing={8}>
          <Grid item xs={12} sm={4} md={4} lg={2}>
            <Paper className={classes.paper}>
              {instrumentsFetching && (
                <CircularProgress className={classes.progress} />
              )}

              {!instrumentsFetching && instruments && (
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
                    {!orderBook && (
                      <CircularProgress className={classes.progress} />
                    )}
                    {orderBook &&
                      orderBook.bids.map((bid, index) => (
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
                    {!orderBook && (
                      <CircularProgress className={classes.progress} />
                    )}
                    {orderBook &&
                      orderBook.asks.map((ask, index) => (
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
                {!trades && <CircularProgress className={classes.progress} />}
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
                            >{`${moment
                              .unix(trade.timestamp)
                              .format("HH:mm:ss")}`}</Typography>
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
          <Typography variant="body1">
            Made with{" "}
            <span role="img" aria-label="heart">
              ❤️
            </span>{" "}
            by Amur Anzorov
          </Typography>
        </div>
        <Notifications notifications={notifications} />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  instruments: makeSelectInstruments(),
  instrumentsFetching: makeSelectInstrumentsFetching(),
  instrument: makeSelectInstrument(),
  orderBook: makeSelectOrderBook(),
  trades: makeSelectTrades(),
  ticker: makeSelectTicker(),
  notifications: makeSelectNotifications()
});

const mapDispatchToProps = dispatch => {
  return {
    fetchInstruments: () => dispatch(fetchInstrumentsRequest()),
    subscribe: (channel, instrument) =>
      dispatch(subscribeToChannel(channel, instrument)),
    unsubscribe: (channel, instrument) =>
      dispatch(unsubscribeFromChannel(channel, instrument))
  };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withStyles(styles),
  withConnect
)(App);
