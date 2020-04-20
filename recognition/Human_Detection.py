import cv2
from imutils.object_detection import non_max_suppression
import numpy as np
import imutils
from imutils import paths
import requests
import time

hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

# cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
# cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
#print(cv2. __version__)
# help(cv2.HOGDescriptor().detectMultiScale)
TSH = 10
HinP = 185

def detectPic():
	state = 0
	# print(type(paths.list_images("D:\\ADMIN\\Desktop\\NCKU\\SOFTWARE ENGINEERING\\AI\\Human_Detection\\VideoCapture")))
	for imagePath in sorted(paths.list_images("D:\\ADMIN\\Desktop\\NCKU\\SOFTWARE ENGINEERING\\AI\\Human_Detection\\VC")):
		print(imagePath)
		frame = cv2.imread(imagePath)
		frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		frame = cv2.GaussianBlur(frame, (5, 5), 3)
		frame = imutils.resize(frame, width=min(400, frame.shape[1]))
		(rects, weights) = hog.detectMultiScale(frame, winStride=(2, 2), padding=(8, 8), scale= 1.5)
		rects = np.array([[x, y, x + w, y + h] for (x, y, w, h) in rects])
		pick = non_max_suppression(rects, probs=None, overlapThresh=0.01)
		if len(pick) > 1:
			continue
		prestate = state
		for (xA, yA, xB, yB) in pick:
			cv2.rectangle(frame, (xA, yA), (xB, yB), (0, 255, 0), 2)
			if yB - yA - (HinP - TSH) < 0:
				state = 1
			elif abs(yB - yA - HinP) <=TSH:
				state = 2
			elif yB - yA - (HinP + TSH) > 0:
				state = 3
			else:
				state = 0

			# if yB - yA - 170 < 0:
			# 	state = 1
			# elif abs(yB - yA - 180) <=10:
			# 	state = 2
			# elif yB - yA - 190 > 0:
			# 	state = 3
			# else:
			# 	state = 0
			# font = cv2.FONT_HERSHEY_SIMPLEX
			# cv2.putText(frame, 'state = ' + str(state), (150,150), font, 1, (255, 0, 0), 5, cv2.LINE_AA)
			# print(yB - yA)
			# 143+-5
			# 192+-5
			# 250+-5
		
		if state == 3 and prestate == 2:
			S = "In"
			my_data = {"status": "enter", "number": 1}
			r = requests.post('https://anticov.tew.tw/api/v1/pass', data = my_data)
			print(r.status_code)
		elif state == 1 and prestate == 2:
			S = "Out"
			my_data = {"status": "exit", "number":1}
			r = requests.post('https://anticov.tew.tw/api/v1/pass', data = my_data)
			print(r.status_code)
		else:
			S = ""
		font = cv2.FONT_HERSHEY_SIMPLEX
		cv2.putText(frame, S, (150,150), font, 1, (255, 0, 0), 5, cv2.LINE_AA)
		cv2.imshow("frame", frame)
		time.sleep(0.25)
		if cv2.waitKey(1) & 0xFF == ord('q'):
			break

def real_time():
	state = 0
	cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
	cap.set(cv2.CAP_PROP_FPS, 60)
	a = 1
	while(True):
		ret, frame = cap.read(0)

		# if cv2.waitKey(1) & 0xFF == ord('s'):
		# print("frame capturated")
		# cv2.imwrite('D:\\ADMIN\\Desktop\\NCKU\\SOFTWARE ENGINEERING\\AI\\Human_Detection\\VideoCapture\\'+ str(a) + '.jpg', frame)
		# a += 1


		frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		frame = cv2.GaussianBlur(frame, (5, 5), 3)
		frame = imutils.resize(frame, width = min(400, frame.shape[1]))
		(rects, weights) = hog.detectMultiScale(frame, winStride=(2, 2), padding=(8, 8), scale= 1.5)
		rects = np.array([[x, y, x + w, y + h] for (x, y, w, h) in rects])
		pick = non_max_suppression(rects, probs=None, overlapThresh=0.01)#0.65)
		


		



		if len(pick) > 1:
			continue
		prestate = state
		for (xA, yA, xB, yB) in pick:
			cv2.rectangle(frame, (xA, yA), (xB, yB), (0, 255, 0), 2)
			if yB - yA - (HinP - TSH) < 0:
				state = 1
			elif abs(yB - yA - HinP) <=TSH:
				state = 2
			elif yB - yA - (HinP + TSH) > 0:
				state = 3
			else:
				state = 0
			# font = cv2.FONT_HERSHEY_SIMPLEX
			# cv2.putText(frame, 'state = ' + str(state), (150,150), font, 1, (255, 0, 0), 5, cv2.LINE_AA)
			
		S = ""
		if state == 3 and prestate == 2:
			S = "In"
			my_data = {"status": "enter", "number":1}
			r = requests.post('https://anticov.tew.tw/api/v1/pass', data = my_data)
			print(r.status_code)
		elif state == 1 and prestate == 2:
			S = "Out"
			my_data = {"status": "exit", "number":1}
			r = requests.post('https://anticov.tew.tw/api/v1/pass', data = my_data)
			print(r.status_code)
		font = cv2.FONT_HERSHEY_SIMPLEX
		cv2.putText(frame, S, (150,150), font, 2, (255, 0, 0), 5, cv2.LINE_AA)

		# frame = cv2.resize(frame, (1920, 1080), interpolation = cv2.INTER_CUBIC)
		cv2.imshow('frame', frame)
		# cv2.imshow('orig', orig)


		# gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		
		# font = cv2.FONT_HERSHEY_SIMPLEX
		# cv2.putText(gray, 'Hello World', (150,150), font, 1, (255, 0, 0), 5, cv2.LINE_AA)
		
		# gray = cv2.GaussianBlur(gray, (5, 5), 0)
		# edged = cv2.Canny(gray, 35, 125)

		# cv2.imshow("edged", edged)
		# cnts = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
		# cnts = imutils.grab_contours(cnts)
		# print("cnts: ", type(cnts))
		# c = max(cnts, key = cv2.contourArea)
		# print("c: ", type(c))

		# cv2.imshow('gray', edged)
		if cv2.waitKey(1) & 0xFF == ord('q'):
			break

		# if cv2.waitKey(1) & 0xFF == ord('s'):
		# 	print("frame capturated")
		# 	cv2.imwrite('D:\\ADMIN\\Desktop\\NCKU\\SOFTWARE ENGINEERING\\AI\\Human_Detection\\VideoCapture\\'+ str(a) + '.jpg', frame)
		# 	a += 1

	'''
	my_data = {"status": "enter", "number":1}# or "exit"
	# login = {"username":"admin", "password":"AntiCoV"}
	# r = requests.post('https://anticov.tew.tw/api/v1/login', data = login)
	# print(type(r.text))
	# my_header = {"Authorization": r.text}
	r = requests.post('https://anticov.tew.tw/api/v1/pass', data = my_data)
	print(r.status_code)
	'''

	cap.release()

	cv2.destroyAllWindows()


# real_time()
detectPic()
