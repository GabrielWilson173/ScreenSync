import sqlite3

DB_PATH = "Database/ScreenTimeDB.db"

def registerUser(username: str, hashed_password: str, user_uuid: str):
    #Open sqlite database and attempt to insert item into the database
    #Username is set as a unique variable so if the username is a copy then this will throw an error
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Users (username, password_hash, uuid) VALUES (?, ?, ?)", 
            (username, hashed_password, user_uuid)
        )
        conn.commit()

#Get the stored hash of the user's password.
def getUserInfo(username: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash, uuid FROM Users WHERE username=?", (username,))
        user = cursor.fetchone()
        
        if user:
            return {"Password": user["password_hash"], "uuid": user["uuid"]}
        else:
            raise Exception("User not found")
