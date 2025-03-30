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
from fastapi import FastAPI, Request, HTTPException, Depends, Query, UploadFile, File, Form
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


# Fetch List of All Tables in the Database
async def get_list_of_tables(db: asyncpg.Connection):
    query = """
    SELECT schemaname || '.' || tablename AS full_table_name
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    """
    result = await db.fetch(query)
    print([row["full_table_name"] for row in result])
    return [row["full_table_name"] for row in result]


# Request Model for Database Query
class QueryRequest(BaseModel):
    tableName: Optional[str] = None
    columns: Optional[List[str]] = None
    values: Optional[List[Any]] = None
    whereClause: Optional[str] = None
    query: Optional[str] = None
    dbName: Optional[str] = PGDATABASE


def serialize_value(value):
    """Ensure all data types are properly formatted for JSON serialization."""
    if isinstance(value, datetime):
        return value.isoformat() 
    elif isinstance(value, Decimal):
        return float(value) 
    elif isinstance(value, dict) or isinstance(value, list):
        return json.loads(json.dumps(value))  
    return value  


@app.post("/db/query")
async def db_query(request: QueryRequest):
    print("db/query")
    print(request)

    try:
        # Dynamically get dbName from the request body
        dbName = request.dbName or PGDATABASE
        print("Using dbName:", dbName)

        # Get connection pool and acquire a connection
        pool = await get_db_pool(dbName)
        async with pool.acquire() as db:

            allowableTables = await get_list_of_tables(db)

            if request.tableName:
                if request.tableName not in allowableTables:
                    raise HTTPException(status_code=400, detail=f"Table '{request.tableName}' does not exist.")

                selected_columns = ", ".join(request.columns) if request.columns else "*"
                query = f"SELECT {selected_columns} FROM {request.tableName} LIMIT 100;"
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



#Add records in a database table
@app.post("/db/insert")
async def insert_record(request: QueryRequest, db: asyncpg.Connection = Depends(get_db_connection)):

    """
    Example body in api request:
        {
            "tableName": "employees", 
            "columns": ["name", "position"], 
            "values": ["Alice", "Developer"], 
            "dbName": "oomnielabs"
        }
    """

    try:
        # Get valid table names
        allowableTables = await get_list_of_tables(db)

        # Validate table
        if request.tableName not in allowableTables:
            raise HTTPException(status_code=400, detail=f"Table '{request.tableName}' does not exist.")

        # Validate columns & values
        if not request.columns or not isinstance(request.values, list) or len(request.columns) != len(request.values):
            raise HTTPException(status_code=400, detail="Columns and values must be provided as equal-length lists.")

        # Construct INSERT statement
        columns = ", ".join(request.columns)
        placeholders = ", ".join(f"${i+1}" for i in range(len(request.values)))  # Use parameterized query
        query = f"INSERT INTO {request.tableName} ({columns}) VALUES ({placeholders}) RETURNING *;"
        
        # Execute query
        response = await db.fetchrow(query, *request.values)

        print(response)
        print(type(response))

        # ✅ Convert asyncpg.Record to dictionary with serialized values
        serialized_response = {key: serialize_value(value) for key, value in dict(response).items()}

        return JSONResponse(content=dict(serialized_response))

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error occurred\n: {str(e)}")



#Update records in a database table
@app.post("/db/update")
async def update_record(request: QueryRequest, db: asyncpg.Connection = Depends(get_db_connection)):

    print(request)

    """
    Example body in API request:
        {
            "tableName": "employees", 
            "columns": ["position"], 
            "values": ["Senior Developer"], 
            "whereClause": "name = 'Alice'", 
            "dbName": "oomnielabs"
        }
    """
    try:
        # Get valid table names
        allowableTables = await get_list_of_tables(db)

        # Validate table
        if request.tableName not in allowableTables:
            raise HTTPException(status_code=400, detail=f"Table '{request.tableName}' does not exist.")

        # Validate columns & values
        if not request.columns or not isinstance(request.values, list) or len(request.columns) != len(request.values):
            raise HTTPException(status_code=400, detail="Columns and values must be provided as equal-length lists.")

        # Validate WHERE condition
        if not request.whereClause:
            raise HTTPException(status_code=400, detail="A WHERE condition is required for updates.")

        # Construct UPDATE statement
        set_clause = ", ".join(f"{col} = ${i+1}" for i, col in enumerate(request.columns))
        query = f"UPDATE {request.tableName} SET {set_clause} WHERE {request.whereClause} RETURNING *;"

        # Execute query and fetch updated values
        response = await db.fetch(query, *request.values)

        if not response:
            raise HTTPException(status_code=404, detail="No matching record found to update.")
        
        updated_record = [{key: serialize_value(value) for key, value in dict(row).items()} for row in response]

        return JSONResponse(content=updated_record[0])

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {str(e)}")


#Delete records from a database table
@app.delete("/db/delete")
async def delete_record(request: QueryRequest, db: asyncpg.Connection = Depends(get_db_connection)):
    """
    Example delete record:
    {
        "tableName": "employees", 
        "whereClause": "name = 'Alice'", 
        "dbName": "oomnielabs"
    }
    """
    
    try:
        # Get valid table names
        allowableTables = await get_list_of_tables(db)

        # Validate table
        if request.tableName not in allowableTables:
            raise HTTPException(status_code=400, detail=f"Table '{request.tableName}' does not exist.")

        # Validate WHERE condition
        if not request.whereClause:
            raise HTTPException(status_code=400, detail="A WHERE condition is required for deletions.")

        # Construct DELETE statement
        query = f"DELETE FROM {request.tableName} WHERE {request.whereClause} RETURNING *;"

        # Execute query
        response = await db.fetch(query)

        # Convert asyncpg.Record to list of dictionaries with serialized values
        serialized_response = [{key: serialize_value(value) for key, value in dict(row).items()} for row in response]

        return JSONResponse(content=[dict(row) for row in serialized_response])

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error occurred: {str(e)}")


# Pydantic Model for Request Validation
class AuthRequest(BaseModel):
    username: str
    pwd: str


# FastAPI Route to Authenticate User
@app.post("/db/authenticateUser")
async def authenticate_user(request: AuthRequest, db=Depends(get_db_connection)):
    try:
        # Fetch stored hashed password from the database
        query = "SELECT * FROM users WHERE username = $1;"
        user_record = await db.fetchrow(query, request.username)

        if not user_record:
            return {"validation": False, "message": "Invalid username or password"}

        stored_hashed_password = user_record["pwd"]

        # Verify the password using bcrypt
        if bcrypt.checkpw(request.pwd.encode("utf-8"), stored_hashed_password.encode("utf-8")):
            user = dict(user_record)  # Convert asyncpg Record to a dictionary

            user.pop("pwd", None)  # Removes "pwd" if it exists, avoids KeyError

            # Ensure values are serializable (e.g., convert datetime, UUIDs)
            sanitized_user_info = {key: str(value) if isinstance(value, (bytes, memoryview)) else value for key, value in user.items()}
            
            return {"validation": True, "user": sanitized_user_info}

        else:
            return {"validation": False, "message": "Invalid username or password"}

    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    

#Create a new user
@app.post("/db/createUser")
async def create_user(request: Request, db=Depends(get_db_connection)):
    
    # Local definitions inside the endpoint
    class CreateUserRequest(BaseModel):
        username: str
        pwd: str
        dbName: str = PGDATABASE

    def hash_password(plain_password: str) -> str:
        """Hash a plain password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    # Manually parse and validate the JSON body using the local Pydantic model
    try:
        body = await request.json()
        user_data = CreateUserRequest(**body)
    except Exception as e:
        return JSONResponse({"validation": "false", "message": str(e)})

    print(f"Creating user: {user_data.username}")
    print(f"Target DB: {user_data.dbName}")
    try:
        # Check if the username already exists
        existing_user = await db.fetchrow("SELECT * FROM users WHERE username = $1", user_data.username)
        if existing_user:
            return JSONResponse({"validation": "false", "message": "Username already exists"})

        # Hash the provided password
        hashed_pwd = hash_password(user_data.pwd)

        # Insert the new user into the database
        await db.execute(
            "INSERT INTO users (username, pwd) VALUES ($1, $2)",
            user_data.username, hashed_pwd
        )
        
        return JSONResponse({"validation": "true", "message": "User created successfully"})
    
    except Exception as e:
        return JSONResponse({"validation": "false", "message": f"Error occurred: {str(e)}"})
    

# Define a Pydantic model for password reset
class ResetPasswordRequest(BaseModel):
    username: str
    new_password: str

# Define a Pydantic model for editing a user record
class EditUserRequest(BaseModel):
    username: str
    updates: dict  # Example: {"email": "newemail@example.com", "role": "admin"}


# Endpoint to reset password
@app.post("/db/resetPassword")
async def reset_password(request: ResetPasswordRequest, db=Depends(get_db_connection)):
    try:
        # Hash the new password before storing
        hashed_password = bcrypt.hashpw(request.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        query = """
            UPDATE users
            SET pwd = $1
            WHERE username = $2
            RETURNING *;
        """

        user = await db.fetchrow(query, hashed_password, request.username)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "Password updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating password: {str(e)}")


# Endpoint to edit user record
@app.post("/db/editUser")
async def edit_user(request: EditUserRequest, db=Depends(get_db_connection)):
    try:
        # Ensure there are updates
        if not request.updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        # Construct SET clause dynamically
        set_clause = ", ".join(f"{key} = ${i+1}" for i, key in enumerate(request.updates.keys()))
        values = list(request.updates.values())
        values.append(request.username)  # Add username for WHERE clause

        query = f"""
            UPDATE users
            SET {set_clause}
            WHERE username = ${len(values)}
            RETURNING *;
        """
        user = await db.fetchrow(query, *values)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User record updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


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