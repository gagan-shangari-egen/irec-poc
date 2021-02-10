import pandas as pd
# from flask_jsonpify import jsonify


def get():
    # data = pd.read_csv("/Users/gshangari/Desktop/code/irec-app-new/backend/order_product.csv")
    # data1 = pd.read_csv("/Users/gshangari/Desktop/code/irec-app-new/backend/rules.csv")
    #data = pd.DataFrame(sales)
    # data.dropna(inplace=True)
    # data_list = data['product_name'].tolist()
    # top_n_items = pd.Index(data_list).value_counts()[:20].to_dict().tolist()
    top_n_item = {'Banana': 472565, 'Bag of Organic Bananas': 379450, 'Organic Strawberries': 264683, 'Organic Baby Spinach': 241921, 'Organic Hass Avocado': 213584, 'Organic Avocado': 176815, 'Large Lemon': 152657, 'Strawberries': 142951, 'Limes': 140627, 'Organic Whole Milk': 137905, 'Organic Raspberries': 137057, 'Organic Yellow Onion': 113426, 'Organic Garlic': 109778, 'Organic Zucchini': 104823, 'Organic Blueberries': 100060, 'Cucumber Kirby': 97315, 'Organic Fuji Apple': 89632, 'Organic Lemon': 87746, 'Apple Honeycrisp Organic': 85020, 'Organic Grape Tomatoes': 84255};
    top_n_items_list = []
    print(top_n_item.items())
    for key, value in top_n_item.iteritems():
        temp = [key,value]
        top_n_items_list.append(temp)
    print(top_n_items)
    # prod_count = data[]
    # print(prod_count)
    
    # p1 = data.groupby('product_name')['product_name'].count().nunique()
    # print(p1)

    # p2 = data.groupby('product_name').count().apply(lambda x: x.sort_values(
    #     ['date'], ascending=False)).reset_index(drop=True)
    # print("p2", p2)
    # result = prod_count.to_dict()
    print(top_n_items_list)
    # rules[rules]
    # print(rules)
    # new = data1["rules"].str.split("=>", n=1, expand=True)
    # data["LHS"] = new[0]
    # data["RHS"] = new[1]
    # rules = data.to_dict()
    # return (result)


if __name__ == "__main__":
    get()
