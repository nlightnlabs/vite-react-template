import os
from dotenv import load_dotenv
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
import asyncpg


#import utilities functions
from .encryption import hash_text, match_encrypted_text


load_dotenv()
PORT = os.getenv('PORT')
ENV = os.getenv('ENV')

PGHOST = os.getenv('NLIGHTN_PGHOST')
PGUSER = os.getenv('NLIGHTN_PGUSER')
PGPASSWORD = os.getenv('NLIGHTN_PGPASSWORD')
PGDATABASE = os.getenv('NLIGHTN_PGDATABASE')
PGPORT = os.getenv('NLIGHTN_PGPORT')
OPEN_AI_API_KEY = os.getenv('NLIGHTN_OPEN_AI_API_KEY')

async def encrypt(text, method):
    hashed = hash_text(text, method)
    return hashed

async def encrypt(text, encrypted_text, method):
    result = match_encrypted_text(text, encrypted_text, method)
    return result

# Connection Pool Storage (Global for Reuse)
db_pools = {}

# Create a reusable connection pool for each database
async def get_db_pool(dbName: str):
    print(dbName)
    if dbName not in db_pools:
        db_pools[dbName] = await asyncpg.create_pool(
            user=PGUSER,
            password=PGPASSWORD,
            database=dbName,
            host=PGHOST,
            port=PGPORT
        )
    return db_pools[dbName]

# Dependency function to get a connection from the pool
async def get_db_connection(dbName: str = PGDATABASE):
    print("dbName", dbName)
    pool = await get_db_pool(dbName)  # Use requested database name
    async with pool.acquire() as connection:
        yield connection  # Ensures proper cleanup after request


# Fetch List of All Tables in the Database (with optional schema)
async def get_list_of_tables(db: asyncpg.Connection, schema: Optional[str] = None):
    if schema:
        query = """
        SELECT schemaname || '.' || tablename AS full_table_name
        FROM pg_tables
        WHERE schemaname = $1;
        """
        result = await db.fetch(query, schema)
    else:
        query = """
        SELECT schemaname || '.' || tablename AS full_table_name
        FROM pg_tables
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
        """
        result = await db.fetch(query)

    return [row["full_table_name"] for row in result]


def serialize_value(value):
    """Ensure all data types are properly formatted for JSON serialization."""
    if isinstance(value, datetime):
        return value.isoformat() 
    elif isinstance(value, Decimal):
        return float(value) 
    elif isinstance(value, dict) or isinstance(value, list):
        return json.loads(json.dumps(value))  
    return value  


# Base model for user model
class UserModel(BaseModel):
    userRecord: Optional[Dict[str, Any]] = None
    dbName: Optional[str] = PGDATABASE
    schema: Optional[str] = "public"
    tableName: Optional[str] = "users"
    dataModel: Optional[Dict[str, Any]] = None


async def authenticate_user(request: UserModel):

    print(request)

    user_record = request.userRecord
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName

    try:

        # Manually get a DB connection from the correct pool
        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:

            # Build the table name dynamically
            full_table_name = f"{schema}.{table_name}"

            # Query to retrieve the user record
            query = f"SELECT * FROM {full_table_name} WHERE username = $1;"
            print(query)
            user = dict(await db.fetchrow(query, user_record.get("username")))
            print(user)

            if not user:
                return {"validation": False, "message": "Invalid username or password"}

            # Validate password
            provided_password = user_record.get("password")
            stored_hashed_password = user.get("password")

            if match_encrypted_text(provided_password, stored_hashed_password, "bcrypt"):
                user.pop("password")

                # Serialize any complex types
                sanitized_user_info = {
                    key: serialize_value(value)
                    for key, value in user.items()
                }

                return {"validation": True, "user": sanitized_user_info}

            return {"validation": False, "message": "Invalid username or password"}

    except Exception as e:
        print(f"Authentication Error: {e}")
        raise {"status_code":500, "detail":"Database error occurred"}
    


# Create a new user
async def create_user(request: UserModel):

    user_record = request.userRecord or {}
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName

    full_table_name = f"{schema}.{table_name}"

    try:
        # Validation
        if not user_record.get("username") or not user_record.get("password"):
            return {"status_code": 400, "status": "ERROR",  "validation": False, "message": "username and password are required"}

        # Hash the password
        if user_record["password"]:
            user_record["password"] = hash_text(str(user_record["password"]))

        # Generate SQL
        columns = list(user_record.keys())
        values = list(user_record.values())
        placeholders = ", ".join(f"${i+1}" for i in range(len(values)))
        column_clause = ", ".join(columns)
        query = f"INSERT INTO {full_table_name} ({column_clause}) VALUES ({placeholders}) RETURNING *;"

        # Run query
        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            result = await db.fetchrow(query, *values)

        inserted_user = dict(result)
        inserted_user.pop("password", None)

        return {"status_code": 200, "status": "OK", "validation": True, "user": inserted_user}

    except Exception as e:
        print(f"Create User Error: {e}")
        return {"status_code": 500, "status": "ERROR", "validation": False, "message": f"Error occurred: {str(e)}"}
        


# Endpoint to reset password
async def reset_password(request: UserModel):

    user_record = request.userRecord or {}
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName

    full_table_name = f"{schema}.{table_name}"

    try:
        # Validation
        if not user_record.get("username") or not user_record.get("password"):
            return {"status_code": 400,"status": "ERROR", "validation": False, "message": "username and password are required"}
        
        # Hash the password
        if user_record["password"]:
            user_record["password"] = hash_text(str(user_record["password"]), "bcrypt")

        # Build update query
        query = f"""
            UPDATE {full_table_name}
            SET password = $1
            WHERE username = $2
            RETURNING *;
        """

        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            updated_user = dict(await db.fetchrow(query, user_record["password"], user_record["username"]))

        if not updated_user:
            return {"status_code": 400,"status": "ERROR", "validation": False, "message": "User not found or update failed"}

        updated_user.pop("password", None)

        return {"status_code": 200,"status": "OK", "validation": True, "user": updated_user}

    except Exception as e:
        print(f"Create User Error: {e}")
        return {"status_code": 500,"status": "ERROR", "validation": False, "message": f"Error occurred: {str(e)}"}



async def edit_user(request: UserModel):

    user_record = request.userRecord or {}
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName

    full_table_name = f"{schema}.{table_name}"

    try:

        # Validation
        if not user_record.get("username") or not user_record.get("password"):
            return {"status_code":400, "validation": False, "message": "username and password are required"}

        # Hash the password
        if user_record["password"]:
            user_record["password"] = hash_text(str(user_record["password"]), "bcrypt")


        # Prepare SET clause
        columns = list(user_record.keys())
        values = list(user_record.values())
        set_clause = ", ".join(f"{col} = ${i+1}" for i, col in enumerate(columns))

        # Add username as last parameter for WHERE clause
        query = f"""
        UPDATE {full_table_name}
        SET {set_clause}
        WHERE username = ${len(columns) + 1}
        RETURNING *;
        """

        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            result = await db.fetchrow(query, *values, user_record.username)

        if not result:
            return {"validation": False, "message": "User not found or update failed"}

        updated_user = dict(result)
        updated_user.pop("password", None)

        return {"validation": True,"message": "User updated successfully","user": updated_user}

    except Exception as e:
        print(f"Edit User Error: {e}")
        return {"validation": False, "message": f"Error occurred: {str(e)}"}



