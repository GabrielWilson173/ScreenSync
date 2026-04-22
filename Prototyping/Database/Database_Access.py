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

def insertScreenTime(uuid: str, app_name: str, screentime: float):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Screentime (uuid, app_name, seconds_spent) VALUES (?, ?, ?) ON CONFLICT (uuid, app_name) DO UPDATE SET seconds_spent = Screentime.seconds_spent + EXCLUDED.seconds_spent, last_updated = CURRENT_TIMESTAMP;", (uuid, app_name, screentime))
        conn.commit()

def getScreenTime(uuid):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Screentime WHERE uuid=?", (uuid,))
        screentime = cursor.fetchall()
        
        if screentime:
            data = []
            for app in screentime:
                data.append({"app_name": app["app_name"], "seconds": app["seconds_spent"]})
            return data
        else:
            raise Exception("No screentime for that user")

