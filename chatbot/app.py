from flask import Flask, request, abort

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import *

import config


app = Flask(__name__)

# Channel Access Token
line_bot_api = LineBotApi(config.linePara['ChannelAccessToken'])
# Channel Secret
handler = WebhookHandler(config.linePara['ChannelSecret'])

user_id = config.linePara['UserID']

'''
@app.route("/push_function/<string:push_text_str>")
def push_message(push_text_str):
    line_bot_api.push_message(user_id, TextSendMessage(text=push_text_str))

# 監聽所有來自 /callback 的 Post Request
@app.route("/callback", methods=['POST'])
def callback():
    # get X-Line-Signature header value
    signature = request.headers['X-Line-Signature']
    # get request body as text
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)
    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        print("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)
    return 'OK'

# 處理傳送到 Server 的訊息
@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    message = TextSendMessage(text=event.message.text)
    line_bot_api.reply_message(event.reply_token, "目前沒有對話功能喔")
'''

# 對多人傳訊息
@app.route("/broadcast_function/<string:broadcast_text_str>")
def broadcast_message(broadcast_text_str):
    broadcast_message = TextSendMessage(text=broadcast_text_str)
    line_bot_api.broadcast(broadcast_message)
    return '----Broadcast Message Sending Successfully !!----'

# 對多人傳送貼圖
@app.route("/StickerSendMessage/")
def location_send_message(package_id, sticker_id):
    sticker_message = StickerSendMessage(p_id = package_id, s_id = sticker_id)
    line_bot_api.broadcast(sticker_message)
    return '----Sticker Message Sending Successfully !!----'

import os
if __name__ == "__main__":
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    #app.run()
