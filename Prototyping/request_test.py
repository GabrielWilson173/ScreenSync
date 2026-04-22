import requests

URL = "http://127.0.0.1:8000"
login_payload = {
    "username": "user",
    "password": "Thisisapassword",
}

# 1. Login to get the token
response = requests.post(f"{URL}/Login/", json=login_payload)

if response.status_code != 200:
    print(f"Login Failed: {response.status_code} - {response.text}")
else:
    # login_data contains {"access_token": "...", "token_type": "bearer"}
    login_data = response.json()
    token = login_data["access_token"]
    
    # 2. Format the header correctly for the next request
    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "Discord" : 50,
        "Chrome" : 100  
    }
    # 3. Send the data to DataTest with the correctly formatted header
    response = requests.post(f"{URL}/Screentime/Add", json=payload, headers=headers)

    if response.status_code == 200:
        print(response.json())
    else:
        print(f"Data Sync Failed: {response.status_code} - {response.text}")