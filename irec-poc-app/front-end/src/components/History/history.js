import React, { Component } from "react";
import Select from "react-select";
import Axios from "axios";
import JuiceBox from "../../assest/images/juiceBox.png";
import "./history.css";

class History extends Component {
  state = {
    options: {},
    cards: [],
    value: [],
    awareness: [],
    sales: [],
    revenue: [],
    selectedValue: {},
    images: [JuiceBox],
  };

  onChange = async (e) => {
    const val = e.value;
    const value = this.state[val];

    console.log(value);
    await this.setState({
      value,
    });
    console.log(this.state.value);
  };

  async componentDidMount() {
    const awareness = JSON.parse(localStorage.getItem("awarenessArray"));
    const sales = JSON.parse(localStorage.getItem("salesArray"));
    const revenue = JSON.parse(localStorage.getItem("revenueArray"));
    await this.setState({
      awareness,
      sales,
      revenue,
    });
  }
  render() {
    const optionss = [
      { value: "awareness", label: "awareness" },
      { value: "sales", label: "sales" },
      { value: "revenue", label: "revenue" },
    ];
    return (
      <div className="awareness-main">
        <div className="row homepage-search-section">
          <div className="col-2"></div>

          <div className="col-8 sales-heading">
            <div className="row">
              <div className="col-12">
                <span className="sales-heading-text">Histroy Promotions</span>
              </div>
            </div>
            <div className="row">
              <div className="col-4"></div>
              <div className="col-4">
                <Select options={optionss} onChange={this.onChange} />
              </div>
              <div className="col-4"></div>
            </div>
          </div>
          <div className="col-2"></div>
        </div>
        {/* <div className="row homepage-search-section">
          <div className="col-2"></div>
          <div className="col-5">
            <Select options={optionss} onChange={this.onChange} />
          </div>
          <div className="col-3">
            <button
              type="button"
              className="btn search-btn"
              onClick={() => this.addPromotion()}
            >
              Add to campaign
            </button>
          </div>
          <div className="col-2"></div>
        </div> */}
        {this.state.value.map((card) => (
          <div className="row homepage-content-section" key={card.label}>
            <div className="col-1"></div>
            <div className="col-10 homepage-content-main">
              <div className="row awareness-content-head-main">
                <div className="col-6">
                  <div className="row">
                    <div className="col-3">
                      <p className="awareness-content-head caps col-12">
                        {card.type}
                      </p>
                    </div>
                    <div className="col-3"></div>
                    <div className="sales-content-tabName col-6">
                      <p className="sales-tabName-ItemsDetails col-12">
                        Items Deatils
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-3 sales-content-tabName">Sold (Unt.)</div>
                <div className="col-3 sales-content-tabName">Sales</div>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="row">
                    <div className="col-6 padding-right">
                      <img
                        className="awareness-image"
                        src={this.state.images[card.img]}
                        alt=""
                      ></img>
                    </div>
                    <div className="col-6 padding-left image-text">
                      <span className="image-text">{card.label}</span>
                    </div>
                  </div>
                </div>
                <div className="col-3 sales-content-tabName2">
                  <div>{Math.round(card.sales) * 7}</div>
                </div>
                <div className="col-3 sales-content-tabName2">
                  <div>{(Math.floor(card.sales) * 6) / 10}%</div>
                </div>
              </div>
            </div>
            <div className="col-1"></div>
          </div>
        ))}
      </div>
    );
  }
}

export default History;
