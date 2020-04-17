import flask
import json
from flask import Flask,request,jsonify,render_template,request


app = Flask(__name__)

@app.route('/',methods = ['GET'])
def index():
    return "Hello !!!"


@app.route('/test', methods = ['POST'])
def boardTest():
    data = json.loads(request.get_data())
    print(json.dumps(data, indent=4))
    return "Post successfully"


if __name__ == '__main__':
    app.run(host="192.168.50.134", port="9002", debug=True)
