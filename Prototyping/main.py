from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash
from uuid import uuid4
from jwt import encode, decode
from Database.Database_Access import registerUser, getUserInfo
from datetime import datetime, timedelta, timezone

app = FastAPI()

SECRET_KEY = "SECRET_KEY"

#Create a user class to let Register_User know if it is recieving the right kind of data
class User(BaseModel):
    username: str
    password: str

#Use a password hashing algorithm that automatically salts the hash to prevent brute force attacks on passwords
password_hasher = PasswordHash.recommended()

#Takes a given uuid and generates a signed JWT to return to the user
def Create_Token(uuid: str):
    #Tells the server the user and the expiration time 
    payload = {
        "uuid": uuid,
        "exp": datetime.now(tz=timezone.utc) + timedelta(minutes=30)
    }
    #make a Signed Json Web Token to be used for authenticating a user
    token = encode(payload, SECRET_KEY, algorithm="HS256")

    return {"access_token": token, "token_type": "bearer"}

#Register user is run an HTTP POST request is sent to http://localhost:8000/Register/ 
@app.post("/Register/")
async def Register_User(user: User):
    try:
        #Hash password before it is stored in the database
        hashed_password = password_hasher.hash(user.password)
        #Unpack user into individual value
        username = user.username
        #Create a unique uuid that will be a primary key for all other tables in the sql database
        uuid = str(uuid4())

        #Add user to the User(username, hashed_password, uuid) table
        registerUser(username, hashed_password, uuid)

        return Create_Token(uuid)
    except:
        #If a user can't be inserted into the SQL table, raise an exception
        #Gets sent back to the user as an HTTP message with status_code != 200
        raise HTTPException(
            status_code=400, 
            detail="Username already taken"
        )

#Login is run an HTTP POST request is sent to http://localhost:8000/Login/  
@app.post("/Login/")
async def Login(user: User):
    try:
        username = user.username
        #Use the username to get the hashed and salted password of the user 
        user_info = getUserInfo(username)
        
        #Check that the entered password hashes to the same as the stored hash of the password
        if password_hasher.verify(user.password, user_info["Password"]):
            return Create_Token(user_info["uuid"])
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except:
        raise HTTPException(status_code=401, detail="Invalid username or password")