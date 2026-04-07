from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash
from uuid import uuid4
from Database.Database_Access import registerUser, getHashedPasswordOfUser

app = FastAPI()

#Create a user class to let Register_User know if it is recieving the right kind of data
class User(BaseModel):
    username: str
    password: str

#Use a password hashing algorithm that automatically salts the hash to prevent brute force attacks on passwords
password_hasher = PasswordHash.recommended()

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

        #Send back a dictionary containing a status update message and the user's uuid
        return {"status": "User created", "uuid": uuid}
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
        user_info = getHashedPasswordOfUser(username)
        
        #Check that the entered password hashes to the same as the stored hash of the password
        if password_hasher.verify(user.password, user_info["Password"]):
            #Send back a dictionary containing a status update message and the user's uuid
            return {"status": "Login Successful", "id": user_info["uuid"]}
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except:
        raise HTTPException(status_code=401, detail="Invalid username or password")

