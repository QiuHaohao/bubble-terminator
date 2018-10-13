from flask import Flask
from flask import request,jsonify
from flask_cors import CORS
from PoliticalClassifier import PoliticalClassifier
import twitter
api = twitter.Api(consumer_key='baO03vmpkrNUB23IwjLlShaDT',consumer_secret='7KjZRDr1Wur07EWJ9W6xXBLqXIKWP6AiIabdRb49EwXE94vIFF',access_token_key='796258490306076677-VuG0bhaok1lSIKvzr271CaJsvc5tl9B',access_token_secret='GUKvcG5cVa4n4Ju0IJlPzzP6A6L9vClvzhedToDeF5qqM')

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
cl = PoliticalClassifier()        

@app.route('/',methods=['POST'])
def get_predictions():
    text = request.get_json()['text']
    print(text)
    result =  { "predictions" : [cl.predict(x) for x in text] }
    return jsonify(result)

@app.route('/user',methods=['POST'])
def get_user_prediction():
    username = request.get_json()['username']
    t=api.GetUserTimeline(screen_name=username,count=100)
    tweets=[i.AsDict()['text'] for i in t]
    print(tweets)
    predicts=[cl.predict(x) for x in tweets]
    result = { "result": sum(predicts)/len(predicts)}
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=443, ssl_context=('/etc/letsencrypt/live/www.ntumods.com/fullchain.pem', '/etc/letsencrypt/live/www.ntumods.com/privkey.pem'))
