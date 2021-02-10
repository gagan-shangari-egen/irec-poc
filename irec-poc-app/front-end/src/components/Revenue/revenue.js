import React, { Component } from "react";
import Select from "react-select";
import Axios from "axios";
import JuiceBox from "../../assest/images/juiceBox.png";
import "./revenue.css";
import emptyCart from "../../assest/images/Cart-empty.gif";

class Revenue extends Component {
  state = {
    options: {},
    images: [JuiceBox],
    cards: [],
    stopedPromotions: [],
    cards2: [],
    selectedValue: {},
    selectedValue2: {},
  };

  getRules = async () => {
    try {
      const data = await Axios.get(`http://127.0.0.1:5031/rules`);
      let arr = [];
      for (let keys in data.data.LHS) {
        let LHS = data.data.LHS[keys].trim();
        let valLHS = LHS.substring(1);
        let valLHS2 = valLHS.substr(0, valLHS.length - 1);
        let RHS = data.data.RHS[keys].trim();
        let valRHS = RHS.substring(1);
        let valRHS2 = valRHS.substr(0, valRHS.length - 1);
        arr.push({
          value: valLHS2,
          label: valRHS2,
        });
      }
      return arr;
    } catch (err) {
      console.log(err);
    }
  };

  onChange = async (value) => {
    let obj = {};
    let obj2 = {};
    let sale = Math.random() * 100;
    let sale2 = Math.random() * 100;
    const index = Math.floor(Math.random() * this.state.images.length);
    const index2 = Math.floor(Math.random() * this.state.images.length);
    obj["value"] = value.value;
    obj["label"] = value.value;
    obj["img"] = 0;
    obj["sales"] = sale;
    obj["type"] = "revenue";
    obj2["value"] = value.label;
    obj2["label"] = value.value;
    obj2["img"] = 0;
    obj2["sales"] = sale2;
    obj2["type"] = "revenue";
    await this.setState({
      selectedValue: obj,
      selectedValue2: obj2,
    });
  };

  removeCard = async (e) => {
    let stopedPromotions = [...this.state.stopedPromotions, e];
    this.setState({
      cards2: this.state.cards2.filter(function (element) {
        return element.value !== e.value;
      }),
      cards: this.state.cards.filter(function (element) {
        return element.value !== e.label;
      }),
      stopedPromotions,
    });
    localStorage.setItem(
      "revenueArray",
      JSON.stringify(this.state.stopedPromotions)
    );
  };

  removeAndAddToCart = async (e) => {
    this.setState({
      cards: this.state.cards.filter(function (element) {
        return element.value !== e.value;
      }),
    });
    this.addFrequentItem(e);
  };

  addFrequentItem = async (e) => {
    await this.setState((prevState) => ({
      cards2: [...prevState.cards2, e],
    }));
  };

  compare = () => {
    let val = this.state.cards.filter(
      (card) => card.value === this.state.selectedValue.value
    );
    let val2 = this.state.cards2.filter(
      (card) => card.value === this.state.selectedValue2.value
    );
    return Math.max(val, val2);
  };

  addPromotion = async () => {
    if (this.compare()) {
      alert("This promo has already been added!");
    } else {
      await this.setState((prevState) => ({
        cards: [...prevState.cards, this.state.selectedValue],
        cards2: [...prevState.cards2, this.state.selectedValue2],
      }));
    }
  };

  async componentDidMount() {
    const data = await this.getRules();
    this.setState({
      options: data,
    });
  }
  render() {
    const optionss = this.state.options;
    return (
      <div className="revenue-main">
        <div className="row homepage-search-section">
          <div className="col-2"></div>
          <div className="col-8 sales-heading">
            <span className="sales-heading-text">Revenue Promotions</span>
          </div>
          <div className="col-2"></div>
        </div>
        <div className="row homepage-search-section">
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
              Add to Cart
            </button>
          </div>
          <div className="col-2"></div>
        </div>
        <div className="row revenue-content-main">
          <div className="col-1"></div>
          {this.state.cards.length !== 0 ? (
            <div className="col-5 revenue-cart-box">
              <div className="revenue-cart-heading">
                Frequently Bought Together
              </div>

              {this.state.cards.map((card) => (
                <div className="row homepage-content-section" key={card.value}>
                  <div className="col-1"></div>
                  <div className="col-10 homepage-content-main">
                    <div className="row">
                      <div className="col-1"></div>
                      <div className="col-3 padding-right">
                        <img
                          className="revenue-image"
                          src={this.state.images[card.img]}
                          alt=""
                        ></img>
                      </div>
                      <div className="col-6 revenue-image-text-main image-text">
                        <span className="revenue-image-text image-text">
                          {card.value}
                        </span>
                      </div>
                      <div className="col-2">
                        <button
                          type="button"
                          className="btn revenue-button col-8"
                          onClick={() => this.removeAndAddToCart(card)}
                        >
                          <span class="material-icons">add_box</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-1"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-5">
              {" "}
              <div></div>
            </div>
          )}
          <div className="col-5 revenue-cart-box">
            <div className="revenue-cart-heading">Your Cart</div>
            {this.state.cards2.length !== 0 ? (
              <div>
                {this.state.cards2.map((card) => (
                  <div
                    className="row homepage-content-section"
                    key={card.value}
                  >
                    <div className="col-1"></div>
                    <div className="col-10 homepage-content-main">
                      <div className="row">
                        <div className="col-1"></div>
                        <div className="col-3 padding-right">
                          <img
                            className="revenue-image"
                            src={this.state.images[card.img]}
                            alt=""
                          ></img>
                        </div>
                        <div className="col-6 revenue-image-text-main image-text">
                          <span className="revenue-image-text image-text">
                            {card.value}
                          </span>
                        </div>
                        <div className="col-2">
                          <button
                            type="button"
                            className="btn revenue-button col-8"
                            onClick={() => this.removeCard(card)}
                          >
                            <span className="material-icons">
                              delete_forever
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-1"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="emptyCart col-12">
                {" "}
                <img className="col-12" src={emptyCart} alt=""></img>{" "}
              </div>
            )}
          </div>
          <div className="col-1"></div>
        </div>
      </div>
    );
  }
}

export default Revenue;
