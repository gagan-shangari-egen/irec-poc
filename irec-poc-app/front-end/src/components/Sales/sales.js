import React, { Component } from "react";
import Axios from "axios";
import "./sales.css";
import JuiceBox from "../../assest/images/juiceBox.png";
import Pagination from "../Pagination/Paginations";
import { paginate } from "../../utils/paginate";
import _ from "lodash";

class Sales extends Component {
  state = {
    options: {},
    cards: [],
    pageSize: 8,
    stopedPromotions: [],
    currentPage: 1,
    sortOrder: { path: "title", order: "asc" },
    images: [JuiceBox],
  };

  getRules = async () => {
    try {
      const data = await Axios.get(`http://127.0.0.1:5031/rules`);
      let arr = [];
      for (let keys in data.data.LHS) {
        const index = Math.floor(Math.random() * this.state.images.length);
        let LHS = data.data.LHS[keys].trim();
        let valLHS = LHS.substring(1);
        let valLHS2 = valLHS.substr(0, valLHS.length - 1);
        let RHS = data.data.RHS[keys].trim();
        let valRHS = RHS.substring(1);
        let valRHS2 = valRHS.substr(0, valRHS.length - 1);
        let sale = Math.random() * 100;
        arr.push({
          value: valLHS2,
          label: valRHS2,
          sales: sale,
          flag: false,
          img: 0,
          type: "sales",
        });
      }
      return arr;
    } catch (err) {
      console.log(err);
    }
  };

  Start = async (e) => {
    let cards = [...this.state.cards];
    let objIndex = cards.findIndex((obj) => obj.value === e.value);
    cards[objIndex].flag = true;
    await this.setState({
      cards,
    });
  };

  Stop = async (e) => {
    let stopedPromotions = [...this.state.stopedPromotions, e];
    let cards = [...this.state.cards];
    let objIndex = cards.findIndex((obj) => obj.value === e.value);
    cards[objIndex].flag = false;
    await this.setState({
      cards,
      stopedPromotions,
    });
    localStorage.setItem(
      "salesArray",
      JSON.stringify(this.state.stopedPromotions)
    );
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleFiltering = () => {
    const { currentPage, pageSize, cards, sortOrder } = this.state;
    const sorted = _.orderBy(cards, [sortOrder.path], [sortOrder.order]);
    const cardData = paginate(sorted, currentPage, pageSize);
    return { totalCount: this.state.cards.length, data: cardData };
  };

  async componentDidMount() {
    const data = await this.getRules();
    this.setState({
      cards: data,
    });
  }
  render() {
    const { currentPage, pageSize, sortOrder } = this.state;

    const { totalCount, data: cardData } = this.handleFiltering();
    return (
      <div className="sales-main">
        <div className="row homepage-search-section">
          <div className="col-2"></div>
          <div className="col-8 sales-heading">
            <span className="sales-heading-text">Sales Promotions</span>
          </div>
          <div className="col-2"></div>
        </div>
        {cardData.map((card) => (
          <div
            className="row homepage-content-section"
            key={(Math.random() * 3 * 2) / 4}
          >
            <div className="col-2"></div>
            <div className="col-8 homepage-content-main">
              <div className="row awareness-content-head-main">
                <div className="col-5">
                  <div className="row">
                    <div className="col-3">
                      <p className="sales-content-head">Sales</p>
                    </div>
                    <div className="sales-content-tabName col-5">
                      <p className="sales-tabName-ItemsDetails">
                        Items Deatils
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-2">
                  <div className="row">
                    <div className="col-11 sales-content-tabName">offer</div>

                    <div className="col-1 sales-content-tabName"></div>
                  </div>
                </div>
                <div className="col-5"></div>
                <div className={card.flag ? "" : "awareness-unActive"}>
                  <span className="awareness-content-active">Active</span>
                </div>
              </div>
              <div className="row">
                <div className="col-5">
                  <div className="row">
                    <div className="col-4 padding-right">
                      <img
                        className="awareness-image"
                        src={this.state.images[card.img]}
                        alt=""
                      ></img>
                    </div>
                    <div className="col-7 padding-left image-text">
                      <span className="image-text">{card.value}</span>
                    </div>
                  </div>
                </div>
                <div className="col-2">
                  <div className="row image-text">
                    <div className="col-11">Buy 2 Get 1</div>

                    <div className="col-1"></div>
                  </div>
                </div>
                <div className="col-5">
                  <div className="row">
                    <div className="col-6 padding">
                      <button
                        type="button"
                        className={
                          card.flag
                            ? "btn btn-success awareness-button col-8"
                            : "btn btn-secondary awareness-button col-8"
                        }
                        onClick={() => this.Start(card)}
                      >
                        Start Promo
                      </button>
                    </div>
                    <div className="col-6 padding">
                      <button
                        type="button"
                        className="btn stop-btn awareness-button col-8"
                        onClick={() => this.Stop(card)}
                      >
                        Stop Promo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-2"></div>
          </div>
        ))}
        <div className="row homepage-search-section">
          <div className="col-2"></div>
          <div className="col-8 sales-heading">
            <Pagination
              count={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
          <div className="col-2"></div>
        </div>
      </div>
    );
  }
}

export default Sales;
