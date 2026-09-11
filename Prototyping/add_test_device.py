import os
import sqlite3
from uuid import uuid4

# Ensure relative DB paths in Database_Access resolve by running from this script's folder
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

from Database.Database_Access import registerUser, getDeviceNum, insertScreenTime, getScreenTime

DB_PATH = "Database/ScreenTimeDB.db"

# Find or create a test user
with sqlite3.connect(DB_PATH) as conn:
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT uuid, username FROM Users LIMIT 1")
    user = cur.fetchone()

if user:
    user_uuid = user['uuid']
    print(f"Using existing user: {user['username']} ({user_uuid})")
else:
    # create a test user
    user_uuid = str(uuid4())
    try:
        registerUser('testuser', 'testhash', user_uuid)
        print(f"Created test user 'testuser' ({user_uuid})")
    except Exception as e:
        print('Could not create test user:', e)
        raise

# Add a third device with a unique hwid
hwid = 'test-hwid-3'
print('Requesting device number for hwid', hwid)
device_num = getDeviceNum(user_uuid, hwid)
print('Got device num:', device_num)

# Insert screentime for that device
# Add a few entries (Chrome 1000s, Discord 300s)
insertScreenTime(user_uuid, device_num, 'Chrome', 1000)
insertScreenTime(user_uuid, device_num, 'Discord', 300)
print('Inserted screentime for device', device_num)

# Print current screentime for user
s = getScreenTime(user_uuid)
print('Current screentime (grouped by device):')
print(s)
