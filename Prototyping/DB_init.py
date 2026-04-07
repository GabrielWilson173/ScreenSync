"""Helper file that initializes a new empty database"""

import sqlite3

DB_PATH = "Database/ScreenTimeDB.db"

def init_db():
    """Run this once tZo create your tables with the correct types."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Users (
                username TEXT UNIQUE,
                password_hash TEXT,
                uuid CHAR(36) PRIMARY KEY
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS User_data (
                uuid CHAR(36),
                data TEXT,
                FOREIGN KEY (uuid) REFERENCES Users (uuid)
            )
        """)
        conn.commit()

init_db()