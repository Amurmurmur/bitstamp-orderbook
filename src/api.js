import serialize from "./utils/serialize";

const baseUrl = "https://www.bitstamp.net/api/v2/";
const feedUrl = "wss://ws.bitstamp.net";

export const fetchBook = ({ productId, ...params }) =>
  window
    .fetch(`${baseUrl}/order_book/${productId}?${serialize(params)}`)
    .then(resp => resp.json());

export const fetchTrades = ({ productId, ...params }) =>
  window
    .fetch(`${baseUrl}/${productId}/trades?${serialize(params)}`)
    .then(resp => resp.json());

export const fetchInstruments = (...params) =>
  window.fetch(`${baseUrl}/trading-pairs-info?${serialize(params)}`).then(resp => resp.json());

export const createFeed = () => new window.WebSocket(feedUrl);
