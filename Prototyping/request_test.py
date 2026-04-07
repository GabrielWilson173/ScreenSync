"""File to test sending requests via the api"""

import requests

ACCEPT = 200

#Here we are sending a login post request with the additional payload of the username and password.
request = "http://localhost:8000/Login/"
payload = {
    "username": "user",
    "password": "Thisisapassword",
}

#Use the requests pip package to send the request
response = requests.post(request, json=payload)

#If the request was successful
if response.status_code == 200:
    print(response.json())
#If the request has an error code
else:
    print(response.status_code)