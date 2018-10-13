from flask import Flask
from flask import request,jsonify
from PoliticalClassifier import PoliticalClassifier
app = Flask(__name__)
cl = PoliticalClassifier()        
@app.route('/',methods=['POST'])
def get_predictions():
    text = request.get_json()['text']
    print(text)
    result =  { "predictions" : [cl.predict(x) for x in text] }
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
