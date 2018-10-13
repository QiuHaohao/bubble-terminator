from flask import Flask
from flask import request,jsonify
from PoliticalClassifier import PoliticalClassifier
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
cl = PoliticalClassifier()        
@app.route('/',methods=['POST'])
def get_predictions():
    text = request.get_json()['text']
    print(text)
    result =  { "predictions" : [cl.predict(x) for x in text] }
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=443, ssl_context=('cert.pem', 'key.pem'))
