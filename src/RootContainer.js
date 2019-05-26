import React from "react";

import { Provider } from "react-redux";
import App from "./App";
import createStore from "./redux";

const store = createStore();

class RootContainer extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

export default RootContainer;
