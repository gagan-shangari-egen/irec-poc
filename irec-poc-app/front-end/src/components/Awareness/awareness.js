import React, { Component } from "react";
import Select from "react-select";
import Axios from "axios";
import "./awareness.css";
import JuiceBox from "../../assest/images/juiceBox.png";

class Awareness extends Component {
  state = {
    options: {},
    cards: [],
    stopedPromotions: [],
    selectedValue: {},
    images: [JuiceBox],
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

  button30Change = async (e) => {
    let cards = [...this.state.cards];
    let objIndex = cards.findIndex((obj) => obj.value === e.value);
    cards[objIndex].three = true;
    cards[objIndex].two = false;
    await this.setState({
      cards,
    });
  };

  button20Change = async (e) => {
    let cards = [...this.state.cards];
    let objIndex = cards.findIndex((obj) => obj.value === e.value);
    cards[objIndex].three = false;
    cards[objIndex].two = true;
    await this.setState({
      cards,
    });
  };

  awarenessStop = async (e) => {
    let stopedPromotions = [...this.state.stopedPromotions, e];
    let cards = [...this.state.cards];
    let objIndex = cards.findIndex((obj) => obj.value === e.value);
    cards[objIndex].three = false;
    cards[objIndex].two = false;
    await this.setState({
      cards,
      stopedPromotions,
    });
    localStorage.setItem(
      "awarenessArray",
      JSON.stringify(this.state.stopedPromotions)
    );
  };

  onChange = async (value) => {
    let obj = {};
    let sale = Math.random() * 100;
    const index = Math.floor(Math.random() * this.state.images.length);
    obj["value"] = value.value;
    obj["label"] = value.label;
    obj["three"] = "";
    obj["two"] = "";
    obj["img"] = 0;
    obj["type"] = "awareness";
    obj["sales"] = sale;
    await this.setState({
      selectedValue: obj,
    });
  };

  removeCard = async (e) => {
    console.log(e);
    let stopedPromotions = [...this.state.stopedPromotions, e];
    console.log(stopedPromotions);
    this.setState({
      stopedPromotions,
      cards: this.state.cards.filter(function (element) {
        return element.value !== e.value;
      }),
    });
    console.log("updated", stopedPromotions);
    localStorage.setItem(
      "awarenessArray",
      JSON.stringify(this.state.stopedPromotions)
    );
  };

  compare = () => {
    let val = this.state.cards.filter(
      (card) => card.value === this.state.selectedValue.value
    );
    return val.length;
  };

  addPromotion = async () => {
    if (this.compare()) {
      alert("This promo has already been added!");
    } else {
      await this.setState((prevState) => ({
        cards: [...prevState.cards, this.state.selectedValue],
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
      <div className="awareness-main">
        <div className="row homepage-search-section">
          <div className="col-2"></div>
          <div className="col-8 sales-heading">
            <span className="sales-heading-text">Awareness Promotions</span>
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
              Add to campaign
            </button>
          </div>
          <div className="col-2"></div>
        </div>
        {this.state.cards.map((card) => (
          <div className="row homepage-content-section" key={card.label}>
            <div className="col-1"></div>
            <div className="col-10 homepage-content-main">
              <div className="row awareness-content-head-main">
                <div className="col-4">
                  <div className="row">
                    <div className="col-4">
                      <p className="awareness-content-head">Awareness</p>
                    </div>
                    <div className="sales-content-tabName col-5">
                      <p className="sales-tabName-ItemsDetails">
                        Items Deatils
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-2 sales-content-tabName">30% offer</div>
                <div className="col-2 sales-content-tabName">20% offer</div>
                <div
                  className={card.three || card.two ? "" : "awareness-unActive"}
                >
                  <span className="awareness-content-active">Active</span>
                </div>
              </div>
              <div className="row">
                <div className="col-4">
                  <div className="row">
                    <div className="col-4 padding-right">
                      <img
                        className="awareness-image"
                        src={this.state.images[card.img]}
                        alt=""
                      ></img>
                    </div>
                    <div className="col-8 padding-left image-text">
                      <span className="image-text">{card.label}</span>
                    </div>
                  </div>
                </div>
                <div className="col-2 padding">
                  <button
                    type="button"
                    className={
                      card.three
                        ? "btn btn-success awareness-button col-8"
                        : "btn btn-secondary awareness-button col-8"
                    }
                    onClick={() => this.button30Change(card)}
                  >
                    30% off
                  </button>
                </div>
                <div className="col-2 padding">
                  <button
                    type="button"
                    className={
                      card.two
                        ? "btn btn-success awareness-button col-8"
                        : "btn btn-secondary awareness-button col-8"
                    }
                    onClick={() => this.button20Change(card)}
                  >
                    20% off
                  </button>
                </div>
                <div className="col-2 padding">
                  <button
                    type="button"
                    className="btn stop-btn awareness-button col-8"
                    onClick={() => this.awarenessStop(card)}
                  >
                    Stop Promo
                  </button>
                </div>
                <div className="col-2 padding">
                  <button
                    type="button"
                    className="btn remove-btn awareness-button col-8"
                    onClick={() => this.removeCard(card)}
                  >
                    Remove
                  </button>
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

export default Awareness;
