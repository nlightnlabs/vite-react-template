# call this when running this file
# uvicorn server:app --host localhost --port 8001 --reload
# for PM2, use: pm2 start "uvicorn [folder name].server:app --host 0.0.0.0 --port 8001 --workers 4" --name fastapi_server --cwd /home/ubuntu

import os
from dotenv import load_dotenv
import importlib
import pandas as pd
import json
import time
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal
import bcrypt
import uvicorn


#Libraries for asynchronouse api calls
from fastapi import FastAPI, Request, HTTPException, Depends, Query, UploadFile, File, Form, Body
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse, ORJSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import orjson
import httpx
import asyncpg
import asyncio
import aiosmtplib
import aiofiles

from pydantic import BaseModel, EmailStr, validator


#Email
from email.message import EmailMessage

#OpenAI
from openai import OpenAI


#for AWS S3
import boto3
import aioboto3  # Async AWS SDK


# Initialize the Flask application
app = FastAPI()


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



load_dotenv()
PORT = os.getenv('PORT')
ENV = os.getenv('ENV')

PGHOST = os.getenv('NLIGHTN_PGHOST')
PGUSER = os.getenv('NLIGHTN_PGUSER')
PGPASSWORD = os.getenv('NLIGHTN_PGPASSWORD')
PGDATABASE = os.getenv('NLIGHTN_PGDATABASE')
PGPORT = os.getenv('NLIGHTN_PGPORT')
OPEN_AI_API_KEY = os.getenv('NLIGHTN_OPEN_AI_API_KEY')

GMAIL_USER = os.getenv('NLIGHTN_GMAIL_USER')
GMAIL_PASSWORD=os.getenv('NLIGHTN_GMAIL_PASSWORD')
GOOGLE_MAPS_API_KEY = os.getenv('NLIGHTN_GOOGLE_MAPS_API_KEY')

#huggingface
HUGGING_FACE_TOKEN = os.getenv('HUGGING_FACE_TOKEN')

# langchain
LANGCHAIN_API_KEY = os.getenv('LANGCHAIN_API_KEY')

#Bitbucket app password:
BITBUCKET_USERNAME = os.getenv('BITBUCKET_USERNAME')
BITBUCKET_TOKEN = os.getenv('BITBUCKET_TOKEN')

#Email
GMAIL_USER=os.getenv('NLIGHTN_GMAIL_USER')
GMAIL_PASSWORD=os.getenv('NLIGHTN_GMAIL_PASSWORD')
GOOGLE_MAPS_API_KEY=os.getenv('NLIGHTN_GOOGLE_MAPS_API_KEY')

templates = Jinja2Templates(directory="templates")  # Set template directory

async def get_server_ip():
    """Fetch server IP address asynchronously"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.ipify.org?format=json")
            return response.json().get("ip", "Unknown")
    except Exception as e:
        print(f"Error fetching server IP: {e}")
        return "Unavailable"
    

# Test api connection
@app.get("/api/test", response_class=JSONResponse)
async def api_test():
    server_ip = await get_server_ip()
    sample_data = {
        'name': 'FastAPI Web Server',
        'version': '1.0',
        'status': 'running',
        'server_ip': server_ip
    }
    return JSONResponse(sample_data)



# Default Server Side Template Rendering
@app.get("/{page}", response_class=HTMLResponse)
@app.get("/", response_class=HTMLResponse)
async def render_page(request: Request, page: str = "index"):
    server_ip = await get_server_ip()  # Async API call

    context = {
        "appName": "Vite React Template",
        "webserver": "FastAPI",
        "currentPage": page,
        "serverIP": server_ip,
    }

    try:
        return templates.TemplateResponse(f"{page}.html", {"request": request, **context})
    except Exception:
        return HTMLResponse(content="Page not found", status_code=404)



@app.post("/utils/hashPassword")
async def hash_password_endpoint(password: str = Body(...)):
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return {"hashed": hashed.decode("utf-8")}


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


# Request Model for Database Query
class QueryRequest(BaseModel):
    dbName: Optional[str] = PGDATABASE
    schema: Optional[str] = "public"
    tableName: Optional[str] = None
    columns: Optional[List[str]] = None
    values: Optional[List[Any]] = None
    whereClause: Optional[str] = None
    query: Optional[str] = None


@app.post("/db/query")
async def db_query(request: QueryRequest):
    print("db/query")
    print(request)

    try:
        dbName = request.dbName or PGDATABASE
        pool = await get_db_pool(dbName)

        async with pool.acquire() as db:
            allowableTables = await get_list_of_tables(db, request.schema)

            # Compose full table name with schema if provided
            full_table_name = (
                f"{request.schema}.{request.tableName}" if request.schema and request.tableName
                else request.tableName
            )

            if request.tableName:
                if full_table_name not in allowableTables:
                    raise HTTPException(status_code=400, detail=f"Table '{full_table_name}' does not exist.")

                selected_columns = ", ".join(request.columns) if request.columns else "*"
                query = f"SELECT {selected_columns} FROM {full_table_name} LIMIT 100;"
            else:
                query = request.query

            response = await db.fetch(query)

            serialized_response = [
                {key: serialize_value(value) for key, value in dict(row).items()}
                for row in response
            ]

            return ORJSONResponse(content=serialized_response)

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")



#Insert a new record into database
@app.post("/db/insert")
async def insert_record(request: QueryRequest):
    """
    Example request body:
    {
        "schema": "public",
        "tableName": "employees", 
        "columns": ["name", "position"], 
        "values": ["Alice", "Developer"], 
        "dbName": "main"
    }
    """

    try:
        # Fallback to default DB if not provided
        dbName = request.dbName or PGDATABASE

        # Get a DB connection from the correct pool
        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:

            # Validate tables
            allowableTables = await get_list_of_tables(db, request.schema)
            full_table_name = (
                f"{request.schema}.{request.tableName}" if request.schema and request.tableName
                else request.tableName
            )

            if full_table_name not in allowableTables:
                raise HTTPException(status_code=400, detail=f"Table '{full_table_name}' does not exist.")

            if not request.columns or not isinstance(request.values, list) or len(request.columns) != len(request.values):
                raise HTTPException(status_code=400, detail="Columns and values must be provided as equal-length lists.")

            # Build query
            columns = ", ".join(request.columns)
            placeholders = ", ".join(f"${i+1}" for i in range(len(request.values)))
            query = f"INSERT INTO {full_table_name} ({columns}) VALUES ({placeholders}) RETURNING *;"

            # Execute
            response = await db.fetchrow(query, *request.values)

            # Serialize
            serialized_response = {key: serialize_value(value) for key, value in dict(response).items()}
            return JSONResponse(content=serialized_response)

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {str(e)}")




#Update records in a database table
@app.post("/db/update")
async def update_record(request: QueryRequest):
    """
    Example body in API request:
    {
        "dbName": "main",
        "schema": "public",
        "tableName": "employees", 
        "columns": ["position"], 
        "values": ["Senior Developer"], 
        "whereClause": "name = 'Alice'"
    }
    """
    print(request)

    try:
        # Pull dbName from the request or use default
        dbName = request.dbName or PGDATABASE

        # Acquire connection from the correct pool
        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:

            # Get valid tables for schema
            allowableTables = await get_list_of_tables(db, request.schema)

            # Build full table name
            full_table_name = (
                f"{request.schema}.{request.tableName}" if request.schema and request.tableName
                else request.tableName
            )

            # Validate the table exists
            if full_table_name not in allowableTables:
                raise HTTPException(status_code=400, detail=f"Table '{full_table_name}' does not exist.")

            # Validate columns and values
            if not request.columns or not isinstance(request.values, list) or len(request.columns) != len(request.values):
                raise HTTPException(status_code=400, detail="Columns and values must be provided as equal-length lists.")

            # Validate WHERE clause
            if not request.whereClause:
                raise HTTPException(status_code=400, detail="A WHERE condition is required for updates.")

            # Build SET clause
            set_clause = ", ".join(f"{col} = ${i+1}" for i, col in enumerate(request.columns))
            query = f"UPDATE {full_table_name} SET {set_clause} WHERE {request.whereClause} RETURNING *;"

            # Execute query
            response = await db.fetch(query, *request.values)

            if not response:
                raise HTTPException(status_code=404, detail="No matching record found to update.")

            updated_record = [
                {key: serialize_value(value) for key, value in dict(row).items()}
                for row in response
            ]

            return JSONResponse(content=updated_record[0])

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {str(e)}")



#Delete records from a database table
@app.delete("/db/delete")
async def delete_record(request: QueryRequest):
    """
    Example delete request:
    {
        "dbName": "main",
        "schema": "public",
        "tableName": "employees", 
        "whereClause": "name = 'Alice'"
    }
    """
    try:
        # Use provided dbName or default
        dbName = request.dbName or PGDATABASE

        # Acquire connection from pool
        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:

            # Get list of tables for schema
            allowableTables = await get_list_of_tables(db, request.schema)

            # Compose full table name
            full_table_name = (
                f"{request.schema}.{request.tableName}" if request.schema and request.tableName
                else request.tableName
            )

            # Validate table existence
            if full_table_name not in allowableTables:
                raise HTTPException(status_code=400, detail=f"Table '{full_table_name}' does not exist.")

            # Validate WHERE clause
            if not request.whereClause:
                raise HTTPException(status_code=400, detail="A WHERE condition is required for deletions.")

            # Construct DELETE query
            query = f"DELETE FROM {full_table_name} WHERE {request.whereClause} RETURNING *;"

            # Execute
            response = await db.fetch(query)

            # Serialize
            serialized_response = [{key: serialize_value(value) for key, value in dict(row).items()} for row in response]

            return JSONResponse(content=serialized_response)

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {str(e)}")




# Unified request model
class UserModel(BaseModel):
    username: str
    password: str
    dbName: Optional[str] = PGDATABASE
    schema: Optional[str] = "public"


@app.post("/db/authenticateUser")
async def authenticate_user(request: Request):
    try:
        # Parse the incoming request body
        body = await request.json()
        auth_data = UserModel(**body)

        # Manually get a DB connection from the correct pool
        pool = await get_db_pool(auth_data.dbName)
        async with pool.acquire() as db:

            # Build the table name dynamically
            full_table_name = f"{auth_data.schema}.users"

            # Query to retrieve the user record
            query = f"SELECT * FROM {full_table_name} WHERE username = $1;"
            print(query)
            user_record = await db.fetchrow(query, auth_data.username)
            print(user_record)

            if not user_record:
                return JSONResponse({"validation": False, "message": "Invalid username or password"})

            stored_hashed_password = user_record["password"]

            # Validate password
            if bcrypt.checkpw(auth_data.password.encode("utf-8"), stored_hashed_password.encode("utf-8")):
                user = dict(user_record)
                user.pop("password", None)

                # Serialize any complex types
                sanitized_user_info = {
                    key: serialize_value(value)
                    for key, value in user.items()
                }

                return JSONResponse({"validation": True, "user": sanitized_user_info})

            return JSONResponse({"validation": False, "message": "Invalid username or password"})

    except Exception as e:
        print(f"Authentication Error: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    

#Create a new user

    try:
        # Parse request body as raw dictionary
        body: Dict[str, Any] = await request.json()

        # Extract required metadata using your existing UserModel model
        meta = UserModel(**body)

        dbName = meta.dbName or PGDATABASE
        schema = meta.schema or "public"
        full_table_name = f"{schema}.users"

        # Ensure required fields
        if not meta.username or not meta.password:
            return JSONResponse({"validation": False, "message": "username and password are required"})

        # Hash the password
        body["password"] = hash_password(meta.password)

        # Prepare query parts
        columns = list(body.keys())
        values = list(body.values())
        placeholders = ", ".join(f"${i+1}" for i in range(len(values)))
        column_clause = ", ".join(columns)
        query = f"INSERT INTO {full_table_name} ({column_clause}) VALUES ({placeholders}) RETURNING *;"

        # Connect and execute
        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:
            result = await db.fetchrow(query, *values)

        # Prepare response
        inserted_user = dict(result)
        inserted_user.pop("password", None)

        return JSONResponse({"validation": True, "user": inserted_user})

    except Exception as e:
        print(f"Create User Error: {e}")
        return JSONResponse({"validation": False, "message": f"Error occurred: {str(e)}"})


#Create a new user
@app.post("/db/createUser")
async def create_user(request: Request):
    try:
        body: Dict[str, Any] = await request.json()
        meta = UserModel(**body)

        dbName = meta.dbName or PGDATABASE
        schema = meta.schema or "public"
        full_table_name = f"{schema}.users"

        if not meta.username or not meta.password:
            return JSONResponse({"validation": False, "message": "username and password are required"})

        columns = list(body.keys())
        values = list(body.values())
        placeholders = ", ".join(f"${i+1}" for i in range(len(values)))
        column_clause = ", ".join(columns)
        query = f"INSERT INTO {full_table_name} ({column_clause}) VALUES ({placeholders}) RETURNING *;"

        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:
            result = await db.fetchrow(query, *values)

        inserted_user = dict(result)
        inserted_user.pop("password", None)

        return JSONResponse({"validation": True, "user": inserted_user})

    except Exception as e:
        print(f"Create User Error: {e}")
        return JSONResponse({"validation": False, "message": f"Error occurred: {str(e)}"})
        

# Define a Pydantic model for password reset
class ResetPasswordRequest(UserModel):
    newPassword: str

# Endpoint to reset password
@app.post("/db/resetPassword")
async def reset_password(request: ResetPasswordRequest):
    try:
        # Pull metadata
        dbName = request.dbName or PGDATABASE
        schema = request.schema or "public"
        full_table_name = f"{schema}.users"

        if not request.username or not request.newPassword:
            return JSONResponse({"validation": False, "message": "username and newPassword are required"})

        # Build update query – let Postgres handle hashing (via crypt() or trigger)
        query = f"""
        UPDATE {full_table_name}
        SET password = $1
        WHERE username = $2
        RETURNING *;
        """

        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:
            updated_user = await db.fetchrow(query, request.newPassword, request.username)

        if not updated_user:
            return JSONResponse({"validation": False, "message": "User not found or update failed"})

        user = dict(updated_user)
        user.pop("password", None)

        return JSONResponse({"validation": True, "message": "Password reset successful", "user": user})

    except Exception as e:
        print(f"Reset Password Error: {e}")
        return JSONResponse({"validation": False, "message": f"Error occurred: {str(e)}"})


# Endpoint to edit user record
class EditUserRequest(UserModel):
    updates: Dict[str, Any]

@app.post("/db/editUser")
async def edit_user(request: EditUserRequest):
    try:
        dbName = request.dbName or PGDATABASE
        schema = request.schema or "public"
        full_table_name = f"{schema}.users"

        if not request.username:
            return JSONResponse({"validation": False, "message": "Username is required"})

        if not request.updates or not isinstance(request.updates, dict):
            return JSONResponse({"validation": False, "message": "No fields provided to update"})

        # Optional: prevent updating username unless explicitly allowed
        if "username" in request.updates:
            return JSONResponse({"validation": False, "message": "Username cannot be changed"})

        # Prepare SET clause
        columns = list(request.updates.keys())
        values = list(request.updates.values())
        set_clause = ", ".join(f"{col} = ${i+1}" for i, col in enumerate(columns))

        # Add username as last parameter for WHERE clause
        query = f"""
        UPDATE {full_table_name}
        SET {set_clause}
        WHERE username = ${len(columns) + 1}
        RETURNING *;
        """

        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:
            result = await db.fetchrow(query, *values, request.username)

        if not result:
            return JSONResponse({"validation": False, "message": "User not found or update failed"})

        updated_user = dict(result)
        updated_user.pop("password", None)

        return JSONResponse({
            "validation": True,
            "message": "User updated successfully",
            "user": updated_user
        })

    except Exception as e:
        print(f"Edit User Error: {e}")
        return JSONResponse({"validation": False, "message": f"Error occurred: {str(e)}"})


# Define request model for validation
class RunAppRequest(BaseModel):
    app_name: str  # Python file/app name without .py
    main_function: str  # Function to call within the module
    parameters: Dict[str, Any] = {}  # Parameters to pass to the function

# Function to dynamically import and run an app function (Synchronous)
def import_app(filepath: str, app_name: str, function: str, parameters: Dict[str, Any]):
    try:
        # Import the module dynamically
        module = importlib.import_module(f"{filepath}.{app_name}")

        # Get the function dynamically
        func = getattr(module, function)

        # Call the function with parameters
        return func(**parameters) if parameters else func()

    except Exception as e:
        raise RuntimeError(f"Error importing or executing {app_name}.{function}: {str(e)}")

# FastAPI endpoint to run a Python app (Fully Asynchronous)
@app.post("/runApp")
async def run_app(request: RunAppRequest):
    filepath = "apps"  # Directory where your apps are stored

    if not request.app_name or not request.main_function:
        raise HTTPException(status_code=400, detail="Module name and function name are required")

    try:
        # Run import_app asynchronously using asyncio.to_thread (non-blocking)
        result = await asyncio.to_thread(import_app, filepath, request.app_name, request.main_function, request.parameters)
        print(f"Result from app: {result}")

        # Handle different response types
        if result is not None:
            if isinstance(result, (dict, list)):
                return result  # FastAPI automatically converts JSON-serializable data
            elif isinstance(result, pd.DataFrame):
                return result.to_dict(orient="records")  # Convert DataFrame to JSON
            else:
                return {"result": str(result)}  # Convert other types to string
        else:
            raise HTTPException(status_code=404, detail="No data found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing app function: {str(e)}")



# Define request model for validation
class OpenAIRequest(BaseModel):
    prompt: str
    data: Optional[Dict[str, Any]] = None
    model: str = "gpt-4"
    temperature: float = 0



# Function to stream OpenAI response
def generate_openai_response(prompt: str, data: Optional[Dict[str, Any]], model: str, temperature: float):
  
    client = client = OpenAI(api_key=OPEN_AI_API_KEY)

    try:
        # Send request to OpenAI
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": json.dumps(data) if data else ""},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            stream=True
        )

        for chunk in completion:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content  # Yield streamed data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error with OpenAI API: {str(e)}")


# FastAPI endpoint for OpenAI chat query
@app.post("/openai/chatgpt")
async def ask_openai(request: OpenAIRequest):
    """
    Exmaple body:
    {
        "prompt": "Explain quantum mechanics", 
        "model": "gpt-4", 
        "temperature": 0.2
    }
    """

    return StreamingResponse(
        generate_openai_response(
            prompt=request.prompt,
            data=request.data,
            model=request.model,
            temperature=request.temperature
        ),
        media_type="text/plain"
    )


OOMNIELLM_URL = "http://172.31.8.107/oomniellm/" if ENV == "production" else "http://34.221.67.65/oomniellm/"

# Request model
class OomnieLLMRequest(BaseModel):
    user_input: str


# Asynchronous generator to stream response
async def generate_streamed_response(payload: dict):
    
    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST", OOMNIELLM_URL, json=payload) as response:
                async for chunk in response.aiter_text():
                    if chunk:
                        print(f"Chunk received: {chunk}", flush=True)  # Debugging
                        yield chunk  # Stream the chunk to the client

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error querying OomnieLLM: {str(e)}")


# FastAPI endpoint for OomniLLM query
@app.post("/oomniellm")
async def oomniellm(request: OomnieLLMRequest):

    """
    Exmaple body:
    {
        "user_input": "Explain quantum mechanics",
        "stream":"true"
    }
    """
        
    return StreamingResponse(
        generate_streamed_response({"user_input": request.user_input}),
        media_type="text/plain"
    )


# AWS S3 access
if ENV == "development":
    s3 = boto3.client(
        "s3",
        region_name="us-west-2",
        aws_access_key_id=os.getenv("NLIGHTN_AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("NLIGHTN_AWS_SECRET_ACCESS_KEY")
    )
else:
    # In production, IAM role credentials from EC2 metadata will be used automatically
    s3 = boto3.client("s3", region_name="us-west-2")



# AWS S3 Configuration
ENV = os.getenv("ENV", "development")
AWS_REGION = "us-west-2"
bucket = "oomnielabs"
s3_client_config = {"region_name": AWS_REGION}

if ENV == "development":
    # Use credentials for development
    bucket = "nlightnlabs01"
    s3_client_config = {
        "region_name": "us-west-1",
        "aws_access_key_id": os.getenv("NLIGHTN_AWS_ACCESS_KEY_ID"),
        "aws_secret_access_key": os.getenv("NLIGHTN_AWS_SECRET_ACCESS_KEY"),
        "endpoint_url":"https://s3.us-west-1.amazonaws.com"
    }

# Async S3 Session
async def get_s3_session():
    return aioboto3.Session()


class S3ListRequest(BaseModel):
    bucketName: Optional[str] = bucket
    path: Optional[str] = ""

# List Files from AWS S3
@app.post("/aws/getFiles")
async def list_files(request: S3ListRequest):
    """
    Example request body:
    {
        "bucketName": "nlightnlabs01",
        "path": "images/",
    }
    """

    session = await get_s3_session()
    async with session.client("s3", **s3_client_config) as s3:
        
        try:
            prefix = request.path
            if prefix and not prefix.endswith("/"):
                prefix += "/"

            params = {"Bucket": request.bucketName, "Prefix": prefix}
            response = await s3.list_objects_v2(**params)

            # ✅ Handle empty folders
            if "Contents" not in response or not response["Contents"]:
                return JSONResponse({"message": "No files found in the specified folder"}, status_code=404)

            files = [
                {
                    "key": obj["Key"],
                    "url": await s3.generate_presigned_url(
                        "get_object", Params={"Bucket": request.bucketName, "Key": obj["Key"]}, ExpiresIn=60
                    ),
                }
                for obj in response["Contents"]
            ]

            return JSONResponse(files)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")



class S3UploadRequest(BaseModel):
    fileName: str
    bucketName: Optional[str] = bucket
    path: Optional[str] = None  # Defaults to `uploads/{fileName}`


# Generate Signed URL for Upload
@app.post("/aws/getS3FolderUrl")
async def get_s3_upload_url(request: S3UploadRequest):

    """
    Example body:
    {
        "fileName": "test_file.txt",
        "bucketName": "nlightnlabs01",
        "path": "testfolder"
    }

    """

    path = request.path or f"uploads/{request.fileName}"

    session = await get_s3_session()
    async with session.client("s3", **s3_client_config) as s3:

        try:
            params = {
                "Bucket": request.bucketName,
                "Key": path.strip("/") + "/" + request.fileName,
                "Expires": 60,
            }
            response = await s3.generate_presigned_url(
                "put_object",
                Params=params,
                ExpiresIn=60  # ✅ Corrected - 'ExpiresIn' is a separate argument
            )
            return response
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating upload URL: {str(e)}")


#Upload file to AWS S3
@app.post("/aws/uploadFile")
async def upload_file(
    file: UploadFile = File(...),  # ✅ Expect multipart/form-data file
    bucketName: str = Form(bucket),  # ✅ Default bucket name
    path: Optional[str] = Form(None)  # ✅ Optional file path
):
    file_name = file.filename
    file_path = path or f"uploads/{file_name}"

    session = await get_s3_session()

    async with session.client("s3", **s3_client_config) as s3:
        try:
            # ✅ Read file asynchronously into memory
            file_content = await file.read()

            # ✅ Upload asynchronously using `put_object`
            await s3.put_object(Bucket=bucketName, Key=file_path, Body=file_content)

            # ✅ Generate the accessible S3 URL
            file_url = f"https://{bucketName}.s3.{AWS_REGION}.amazonaws.com/{file_path}"

            return {"message": "File uploaded successfully", "url": file_url}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
        


# Delete File from AWS S3
class S3DeleteRequest(BaseModel):
    filePath: str
    bucketName: Optional[str] = bucket

@app.post("/aws/deleteFile")
async def delete_file(request: S3DeleteRequest):
    async with get_s3_session() as session:
        async with session.client("s3", region_name=AWS_REGION) as s3:
            try:
                response = await s3.delete_object(Bucket=request.bucketName, Key=request.filePath)
                return JSONResponse(response)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")




# API endpoint to fetch assets (requires OAuth2 token)
@app.get("/oomnitza/getData")
async def get_data(object="assets"):
    """
    Fetch objects from Oomnitza API using the API token stored in an environment variable.
    object can be:
        accessories,
        assets,
        contracts,
        kits,
        users,
        software,
        saas,
        subscriptions,
        locations,
        custom_objects,
        connectors,
        workflow,
    """
    token = os.getenv("OOMNITZA_DEMO_API_TOKEN")
    print(token)
    if not token:
        raise HTTPException(status_code=500, detail="API token not set in environment variables")

    headers = {"Authorization2": token}

    async with httpx.AsyncClient() as client:
        response = await client.get("https://labs.oomnitza.com/api/v3/{object}", headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


class Attachment(BaseModel):
    name: str
    type: str
    size: int
    lastModified: int
    content: str

class EmailPayload(BaseModel):
    to_email: List[EmailStr]
    cc: Optional[List[EmailStr]] = []
    bcc: Optional[List[EmailStr]] = []
    from_email: Optional[EmailStr] = None
    subject: Optional[str] = ""
    message: Optional[str] = ""
    attachments: Optional[List[Attachment]] = []

    @validator("from_email", pre=True, always=True)
    def empty_string_to_none(cls, v: Any) -> Any:
        return v or None


import base64
@app.post("/sendEmail")
async def send_email(payload: EmailPayload) -> dict:
    msg = EmailMessage()
    msg["From"] = payload.from_email or GMAIL_USER
    msg["To"] = ", ".join(payload.to_email)
    msg["Cc"] = ", ".join(payload.cc)
    msg["Bcc"] = ", ".join(payload.bcc)
    msg["Subject"] = payload.subject
    msg.set_content(payload.message)

    print(msg)

    # Add attachments
    for attachment in payload.attachments or []:
        try:
            content = attachment.content
            name = attachment.name
            mime_type = attachment.type or "application/octet-stream"

            # Handle base64 with optional data URI prefix
            if content.startswith("data:"):
                _, base64_data = content.split(",", 1)
            else:
                base64_data = content

            file_data = base64.b64decode(base64_data)
            maintype, subtype = mime_type.split("/") if "/" in mime_type else ("application", "octet-stream")

            msg.add_attachment(
                file_data,
                maintype=maintype,
                subtype=subtype,
                filename=name
            )
        except Exception as e:
            return {"error": f"Failed to attach {name}: {str(e)}"}

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=GMAIL_USER,
            password=GMAIL_PASSWORD
        )
        return {"status": "Email sent successfully"}
    except Exception as e:
        return {"error": str(e)}



@app.post("/send_email_from_oomnitza")
async def send_email_from_oomnitza(payload: EmailPayload) -> dict:
    msg = EmailMessage()
    msg["From"] = payload.from_email or GMAIL_USER
    msg["To"] = ", ".join(payload.to_email)
    msg["Cc"] = ", ".join(payload.cc)
    msg["Bcc"] = ", ".join(payload.bcc)
    msg["Subject"] = payload.subject
    msg.set_content(payload.message)

    # Add attachments
    for attachment in payload.attachments or []:
        try:
            content = attachment.content
            name = attachment.name
            mime_type = attachment.type or "application/octet-stream"

            # Handle base64 with optional data URI prefix
            if content.startswith("data:"):
                _, base64_data = content.split(",", 1)
            else:
                base64_data = content

            file_data = base64.b64decode(base64_data)
            maintype, subtype = mime_type.split("/") if "/" in mime_type else ("application", "octet-stream")

            msg.add_attachment(
                file_data,
                maintype=maintype,
                subtype=subtype,
                filename=name
            )
        except Exception as e:
            return {"error": f"Failed to attach {name}: {str(e)}"}

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.mailgun.org",
            port=587,
            start_tls=True,
            username="postmaster@sandboxedef907d62824131b7c5527c0b828750.mailgun.org",
            password="0d7997e25c2566f42f2684fafbe5a5e5"
        )
        return {"status": "Email sent successfully"}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    port = 8001
    uvicorn.run(
        "server:app",
        host="localhost",
        port=port,
        reload=True,
        log_level="info"
    )