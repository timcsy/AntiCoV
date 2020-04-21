import requests
import sys

class LineBotFunction:

    def __init__(self, push_str, webhook_url):
        self.push_str = push_str
        self.webhook_url = webhook_url
        
    def push_message(self):
        if self.push_str is None:
            print("未輸入字串，不發送 request")
            print("使用方式：請在 python3 ~/LineBotPushMessage.py 空一格輸入參數，記得要加上雙引號")
            print("範例： python3 LineBotPushMessage.py \"how are you\"")
        else:
            requests.get(self.webhook_url + self.push_str)
            print(self.webhook_url + self.push_str)


if __name__ == "__main__":

    Webhook_URL = "https://anticov.herokuapp.com/broadcast_function/"  # 修改成自己的 Webhook URL
    try:
        push_str = sys.argv[1]
    except Exception:
        push_str = None

    LineBot = LineBotFunction(push_str, Webhook_URL)
    LineBot.push_message()
