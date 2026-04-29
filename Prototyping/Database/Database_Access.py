import sqlite3
from typing import Any

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

def insertScreenTime(uuid: str, device_num:int, app_name: str, screentime: float):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Screentime (uuid, device_num, app_name, seconds_spent) VALUES (?, ?, ?, ?) ON CONFLICT (uuid, device_num, app_name) DO UPDATE SET seconds_spent = Screentime.seconds_spent + EXCLUDED.seconds_spent, last_updated = CURRENT_TIMESTAMP;", (uuid, device_num, app_name, screentime))
        conn.commit()

#Use the user and hardware id to get the device number. If the device isn't registered register it
def getDeviceNum(uuid: str, hwid: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT device_num FROM devices WHERE uuid=? AND hwid=?", (uuid, hwid))
        result = cursor.fetchone()

        if result:
            return result["device_num"]

    return registerNewDevice(uuid, hwid)

#Register a new device and return the result
def registerNewDevice(uuid: str, hwid: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO devices (uuid, hwid, device_num) 
            SELECT ?, ?, COALESCE(MAX(device_num), 0) + 1 
            FROM devices WHERE uuid = ?
        """, (uuid, hwid, uuid))
        conn.commit()

        cursor.execute("SELECT device_num FROM devices WHERE uuid=? AND hwid=?", (uuid, hwid))
        result = cursor.fetchone()
        
        return result[0] if result else None

def getScreenTime(uuid):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Screentime WHERE uuid=?", (uuid,))
        screentime = cursor.fetchall()

        if screentime:
            data = []
            for app in screentime:
                data.append({"device_number": app["device_num"], "app_name": app["app_name"], "seconds": app["seconds_spent"]})
            return data
        else:
            raise Exception("No screentime for that user")

def getCredits(uuid: str) -> float:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT credits FROM UserCredits WHERE uuid=?", (uuid,))
        credits = cursor.fetchone()

        if credits:
            return credits["credits"]
        else:
            return 0.0

def updateCredits(uuid: str, credits: float) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO UserCredits (uuid, credits) VALUES (?, ?) ON CONFLICT (uuid) DO UPDATE SET credits = UserCredits.credits + EXCLUDED.credits;", (uuid, credits))
        conn.commit()

def getEarnedCredits(uuid: str, until_time: int) -> float:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM EarnedCredits WHERE uuid=? AND time_to_award <= ?", (uuid, until_time))
        credits = cursor.fetchall()

        if credits:
            earned_credits = 0.0
            for credit in credits:
                earned_credits += credit["credits"]
            return earned_credits
        else:
            raise Exception("No earned credits for that user")

def addEarnedCredits(uuid: str, credits: float, time_to_award: int) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO EarnedCredits (uuid, time_to_award, credits) VALUES (?, ?, ?) ON CONFLICT (uuid, time_to_award) DO UPDATE SET credits = EarnedCredits.credits + EXCLUDED.credits;", (uuid, time_to_award, credits))
        conn.commit()

def deleteEarnedCredits(uuid: str, until_time: int) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM EarnedCredits WHERE uuid=? AND time_to_award <= ?", (uuid, until_time))
        conn.commit()

def getCreditsRate(uuid: str, app_name: str) -> dict[str, Any]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM CreditsRate WHERE uuid=? AND app_name=?", (uuid, app_name))
        rate = cursor.fetchone()

        if rate:
            return {"cost_rate": rate["cost_rate"], "earn_rate": rate["earn_rate"], "earn_delay": rate["earn_delay"]}
        else:
            raise Exception("No credit rates for that user and app")
