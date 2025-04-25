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


#import utilitie functions
from utilities.pgdtconversion import convert_data_type
from utilities.encryption import hash_text, match_encrypted_text
import utilities.postgres_db as pgdb
import utilities.user_records as userdb

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



#Encrtyption Utilities Routes ########################################################################################

from utilities.encryption import hash_text, match_encrypted_text

@app.post("/utilities/encrypt")
async def encrypt(text: Optional[str] = Body(...), method: Optional[str] = Body(...)):
    hashed = hash_text(text, method)
    return hashed

@app.post("/utilities/verify")
async def encrypt(text: Optional[str] = Body(...), encrypted_text: Optional[str] = Body(...), method: Optional[str] = Body(...)):
    result = match_encrypted_text(text, encrypted_text, method)
    return result




#General Postgres Database Routes ########################################################################################

#General database query:  Reroute to imported function
@app.post("/db/query")
async def db_query(request: pgdb.DbQueryModel):
    result =  await pgdb.db_query(request)
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

#Table Query:  Reroute to imported function
@app.post("/db/table")
async def db_table(request: pgdb.DbQueryModel):
    result =  await pgdb.db_table(request)

    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

#Get list of unique values from a field in a database table
@app.post("/db/list")
async def db_list(request: pgdb.DbQueryModel):
    result =  await pgdb.db_list(request)
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

#Insert a new record into database
@app.post("/db/insert")
async def insert_records(request: pgdb.DbQueryModel):
    result = await pgdb.insert_records(request)
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

#Update records in a database table
@app.post("/db/update")
async def update_records(request: pgdb.DbQueryModel):
    result = await pgdb.update_records(request)
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

#Delete records from a database table
@app.delete("/db/delete")
async def delete_records(request: pgdb.DbQueryModel = Body(...)):
    # print("[DEBUG] Raw request body:", request)
    # return request
    result = await pgdb.delete_records(request)
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result




#User Records Database Routes #########################################################################################
@app.post("/db/authenticateUser")
async def authenticate_user(request: userdb.UserModel):
    return await userdb.authenticate_user(request)

#Create a new user
@app.post("/db/createUser")
async def create_user(request: userdb.UserModel):
    return await userdb.create_user(request)


@app.post("/db/editUser")
async def edit_user(request: userdb.UserModel):
    return await userdb.edit_user(request)


@app.post("/db/resetPassword")
async def reset_password(request: userdb.UserModel):
    return await userdb.reset_password(request)


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