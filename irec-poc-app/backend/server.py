import pandas as pd
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify

app = Flask(__name__)
api = Api(app)

CORS(app)


@app.route("/")
def hello():
    return jsonify({'text': 'Hello World!'})


class Rules(Resource):
    def get(self):
        data = pd.read_csv(
            "/Users/gshangari/Desktop/code/irec-10102020/Irec/backend/rules.csv")
        data.dropna(inplace=True)
        new = data["rules"].str.split("=>", n=1, expand=True)
        data["LHS"] = new[0]
        data["RHS"] = new[1]
        rules = data.to_dict()
        return jsonify(rules)


class GetTopNBoughtItems(Resource):
    def get(self):
        # data = pd.read_csv("/Users/gshangari/Desktop/code/irec-app-new/backend/order_product.csv")
        # data.dropna(inplace=True)
        # data_list = data['product_name'].tolist()
        # top_n_items = pd.Index(data_list).value_counts()[:20].index.tolist()
        top_n_items = {'Banana': 472565, 'Bag of Organic Bananas': 379450, 'Organic Strawberries': 264683, 'Organic Baby Spinach': 241921, 'Organic Hass Avocado': 213584, 'Organic Avocado': 176815, 'Large Lemon': 152657, 'Strawberries': 142951, 'Limes': 140627, 'Organic Whole Milk': 137905,
                       'Organic Raspberries': 137057, 'Organic Yellow Onion': 113426, 'Organic Garlic': 109778, 'Organic Zucchini': 104823, 'Organic Blueberries': 100060, 'Cucumber Kirby': 97315, 'Organic Fuji Apple': 89632, 'Organic Lemon': 87746, 'Apple Honeycrisp Organic': 85020, 'Organic Grape Tomatoes': 84255}
        print(top_n_items.items())
        return top_n_items


class GetCrossSellingItems(Resource):
    def get(self):
        # xgboost -> collab -> given a product, whether a user will buy it or not
        result = []
        data = pd.read_csv(
            "/Users/gshangari/Desktop/code/irec-app-new/backend/rules.csv")
        data.dropna(inplace=True)
        new = data["rules"].str.split("=>", n=1, expand=True)
        data["LHS"] = new[0]
        data["RHS"] = new[1]
        rules = data.to_dict()
        return jsonify(rules)


api.add_resource(Rules, '/rules')  # Route_1
api.add_resource(GetTopNBoughtItems, '/sales')  # Route_2
api.add_resource(GetCrossSellingItems, '/revenue')  # Route_2


if __name__ == '__main__':
    app.run(port=5031)
