import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./homepage.css";

class homepage extends Component {
  state = {};
  render() {
    return (
      <div className="homepage-main">
        <h2 className="header">
          <div className="header-border">
            <span className="iREC">iRec</span>
          </div>
        </h2>

        <div>
          <div class="sidenav">
            <span>
              <NavLink to="/awareness">Awareness</NavLink>
            </span>
            <span>
              <NavLink to="/sales">Sales</NavLink>
            </span>
            <span>
              <NavLink to="/revenue">Revenue</NavLink>
            </span>
            <span>
              <NavLink to="/history">History</NavLink>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default homepage;
