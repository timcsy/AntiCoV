import requests
import websocket
import json
import os


def on_message(ws, message):
    print("received: " + message)
    #{"alarm":"bad"}
    if message[10] == 'b':
        os.system("python3 LineBotPushMessage.py \"有人沒量體溫呢~~\"")
        os.system("python3 LineBotPushMessage.py \"" + message + "\"")
    #{"alarm":"fever"}
    elif message[10] == 'f':
        os.system("python3 LineBotPushMessage.py \"哇...發燒了!!\"")
        os.system("python3 LineBotPushMessage.py \"" + message + "\"")
        
def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### Websocket Closed ###")

def on_open(ws):
    req = {
        "cmd": "temperature",
        "device": "board",
        "temperature": 36
    }
    msg_json = json.dumps(req)
    ws.send(msg_json)
    print("sending: " + msg_json)


if __name__ == "__main__":
    access_key = {
        "username": "admin",
        "password": "AntiCoV"
    }
    r = requests.post('https://anticov.tew.tw/api/v1/login', data=access_key)
    print(r.text)
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp('wss://anticov.tew.tw/data?token=' + r.text, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()
    #ws.run_forever(ping_timeout=30)
    print("==========Web Socket Terminating==========")
