"""Helper file that initializes a new empty database"""

import sqlite3

DB_PATH = "Database/ScreenTimeDB.db"

def init_db():
    """Run this once to create your tables with the correct types."""
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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Screentime (
                uuid CHAR(36),
                app_name TEXT,
                seconds_spent FLOAT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (uuid, app_name) -- This joins them into one unique identifier
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS UserCredits (
                uuid CHAR(36) PRIMARY KEY,
                credits REAL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS EarnedCredits (
                uuid CHAR(36),
                time_to_award, -- unix time
                credits REAL,
                PRIMARY KEY (uuid, time_to_award)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS CreditsRate (
                uuid CHAR(36),
                app_name TEXT,
                cost_rate REAL, -- credits consumed per hour of screentime
                earn_rate REAL, -- credits earned per hour of screentime
                earn_delay INT, -- delay (in seconds) between screentime and when to award the user the earned credits
                PRIMARY KEY (uuid, app_name)
            )
        """)
        conn.commit()

init_db()
