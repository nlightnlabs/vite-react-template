
import os
from dotenv import load_dotenv
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal
import asyncpg

from pydantic import BaseModel


#import utilities functions
from .pgdtconversion import convert_data_type
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


# Request Model for Database Query
class DbQueryModel(BaseModel):
    dbName: Optional[str] = PGDATABASE
    schema: Optional[str] = "public"
    tableName: Optional[str] = None
    fieldName: Optional[str] = None
    dataModel: Optional[List[Dict[str, Any]]] = None
    records: Optional[List[Dict[str,Any]]] = None
    whereClause: Optional[List[Dict[str,Any]]] = None
    query: Optional[str] = None

async def db_query(request: DbQueryModel):

    db_name = request.dbName
    query = request.query

    try:
        pool = await get_db_pool(db_name)

        async with pool.acquire() as db:
            response = await db.fetch(query)

            if response and "json_agg" in query.lower():
                # Assumes only one row and one column
                return list(response[0].values())[0]  # Return only the list part
            else:
                serialized_response = [
                    {key: serialize_value(value) for key, value in dict(row).items()}
                    for row in response
                ]
                return serialized_response

    except Exception as e:
        return e
    


# Select entire table from a database
async def db_table(request: DbQueryModel):
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName
    where_block = request.whereClause  # can be a string or list of dicts

    try:
        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            full_table_name = f"{schema}.{table_name}"

            # Validate table exists
            allowable_tables = await get_list_of_tables(db, schema)
            if full_table_name not in allowable_tables:
                raise {"status_code": 400, "message": f"Table '{full_table_name}' does not exist."}

            query = f"SELECT * FROM {full_table_name}"
            params = []
            where_sql = ""

            # Case 1: whereClause is a string (e.g., "status = 'active'")
            if isinstance(where_block, str) and where_block.strip():
                where_sql = f" WHERE {where_block}"

            # Case 2: whereClause is a list of dicts (e.g., [{"id": 1}, {"id": 2}])
            elif isinstance(where_block, list) and all(isinstance(item, dict) for item in where_block):
                where_clauses = []
                param_index = 1

                for clause in where_block:
                    if not clause:
                        continue
                    sub_parts = []
                    for k, v in clause.items():
                        sub_parts.append(f"{k} = ${param_index}")
                        params.append(v)
                        param_index += 1
                    where_clauses.append(f"({' AND '.join(sub_parts)})")

                if where_clauses:
                    where_sql = f" WHERE {' OR '.join(where_clauses)}"

            # Final query string
            query += where_sql + ";"
            response = await db.fetch(query, *params)

            # Serialize results
            serialized_response = [
                {key: serialize_value(value) for key, value in dict(row).items()}
                for row in response
            ]
            return serialized_response

    except Exception as e:
        return {"error": str(e)}


#Get list of unique values from a field in a database table
async def db_list(request: DbQueryModel):
    db_name = request.dbName
    field_name = request.fieldName
    schema = request.schema
    table_name = request.tableName

    query = f"""
        SELECT array_agg(DISTINCT {field_name}) AS result
        FROM {schema}.{table_name};
    """

    try:
        pool = await get_db_pool(db_name)

        async with pool.acquire() as db:
            values = await db.fetchval(query)  # returns a Python list directly

        return values

    except Exception as e:
        return e


# Create new Records
async def insert_records(request: DbQueryModel):
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName
    records = request.records
    data_model = request.dataModel

    try:
        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            full_table_name = f"{schema}.{table_name}"

            # Validate table exists
            allowable_tables = await get_list_of_tables(db, schema)
            if full_table_name not in allowable_tables:
                raise {"status_code": 400, "message": f"Table '{full_table_name}' does not exist."}

            if not records:
                return {"status": "No records to insert."}

            # Detect all fields used across records
            all_fields = sorted({field for record in records for field in record})
            primary_keys = [f for f, v in data_model.items() if v.get("primary_key")]

            if not primary_keys:
                raise {"status_code": 400, "message": "No primary keys defined in dataModel."}

            rows = []
            params = []
            param_counter = 1

            for record in records:
                row_values = []
                for field in all_fields:
                    value = record.get(field)

                    model_entry = data_model.get(field)
                    if model_entry:
                        if model_entry.get("encrypted"):
                            value = hash_text(str(value), "bcrypt")
                        else:
                            value = convert_data_type(value, model_entry.get("data_type"))

                    row_values.append(f"${param_counter}")
                    params.append(value)
                    param_counter += 1

                rows.append(f"({', '.join(row_values)})")

            # INSERT INTO ... VALUES (...), (...), (...) ON CONFLICT DO NOTHING
            insert_query = f"""
                INSERT INTO {full_table_name} ({', '.join(all_fields)})
                VALUES {', '.join(rows)}
                ON CONFLICT ({', '.join(primary_keys)}) DO NOTHING;
            """

            await db.execute(insert_query, *params)

            # Return inserted records by querying primary keys
            key_field_values = [
                tuple(record[k] for k in primary_keys)
                for record in records
                if all(k in record for k in primary_keys)
            ]
            where_clause = " OR ".join(
                "(" + " AND ".join(f"{k} = {repr(v)}" for k, v in zip(primary_keys, key_vals)) + ")"
                for key_vals in key_field_values
            )
            fetch_query = f"SELECT * FROM {full_table_name} WHERE {where_clause};"
            result = await db.fetch(fetch_query)

            return [
                {k: serialize_value(v) for k, v in dict(row).items()}
                for row in result
            ]

    except Exception as e:
        return {"error": str(e)}



#Update records in a database table
async def update_records(request: DbQueryModel):
    """
    Example body in API request:
    {
        "dbName": "main",
        "schema": "public",
        "tableName": "employees", 
        "dataTypeMap": {"id":"TEXT", "record_created": "TIMESTAMPLE", "name":"TEXT", "description":"TEXT"}
        "columns": ["position"], 
        "values": ["Senior Developer"], 
        "whereClause": "name = 'Alice'"
    }
    """
    print(request)
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName
    records = request.records
    data_model = request.dataModel
    if isinstance(data_model, list):
        data_model = {item["field_name"]: item for item in data_model if "field_name" in item}

    try:
        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            full_table_name = f"{schema}.{table_name}"

            # Validate table
            allowable_tables = await get_list_of_tables(db, schema)
            if full_table_name not in allowable_tables:
                raise {"status_code": 400, "message": f"Table '{full_table_name}' does not exist."}

            # Determine update fields (excluding 'id')
            update_fields = sorted({key for record in records for key in record if key != "id"})
            id_list = [r["id"] for r in records]

            # Build CASE WHEN blocks for each field
            case_blocks = {field: [] for field in update_fields}
            params = []
            param_idx = 1

            for record in records:
                record_id = record["id"]
                for field in update_fields:
                    value = record[field]

                    # Data type conversion and encryption
                    model_entry = data_model.get(field)
                    if model_entry:
                        if model_entry.get("encrypted"):
                            value = hash_text(str(value), "bcrypt")
                        else:
                            value = convert_data_type(value, model_entry.get("data_type"))

                    case_blocks[field].append(f"WHEN id = ${param_idx} THEN ${param_idx + 1}")
                    params.extend([record_id, value])
                    param_idx += 2

            # Combine CASE WHEN clauses per field
            set_clauses = []
            for field, clauses in case_blocks.items():
                case_expr = f"{field} = CASE " + " ".join(clauses) + f" ELSE {field} END"
                set_clauses.append(case_expr)

            # Build final query
            id_placeholders = ', '.join(str(i) for i in id_list)
            query = f"""
                UPDATE {full_table_name}
                SET {', '.join(set_clauses)}
                WHERE id IN ({id_placeholders});
            """

            # print("\n==== SQL DEBUG START ====")
            # print("QUERY:\n", query)
            # for idx, param in enumerate(params):
            #     print(f"${idx+1} = {param} (type: {type(param)})")
            # print("==== SQL DEBUG END ====\n")

            await db.execute(query, *params)

            # Fetch updated records
            fetch_query = f"SELECT * FROM {full_table_name} WHERE id IN ({id_placeholders});"
            response = await db.fetch(fetch_query)

            serialized_response = [
                {key: serialize_value(value) for key, value in dict(row).items()}
                for row in response
            ]
            return serialized_response

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}



#Delete records from a database table
async def delete_records(request: DbQueryModel):
    db_name = request.dbName
    schema = request.schema
    table_name = request.tableName
    where_clause = request.whereClause
    full_table_name = f"{schema}.{table_name}"

    try:
        pool = await get_db_pool(db_name)
        async with pool.acquire() as db:
            # Validate table
            allowable_tables = await get_list_of_tables(db, schema)
            if full_table_name not in allowable_tables:
                return {"error": f"Table '{full_table_name}' does not exist."}

            if not where_clause:
                return {"error": "No whereClause provided for deletion."}

            # If whereClause is a list of dicts (e.g., [{id:1}, {id:2}])
            if isinstance(where_clause, list) and all(isinstance(item, dict) for item in where_clause):
                params = []
                param_counter = 1
                where_clauses = []

                for clause in where_clause:
                    sub_parts = []
                    for key, val in clause.items():
                        sub_parts.append(f"{key} = ${param_counter}")
                        params.append(val)
                        param_counter += 1
                    where_clauses.append(f"({' AND '.join(sub_parts)})")

                where_block = " OR ".join(where_clauses)
                delete_query = f"DELETE FROM {full_table_name} WHERE {where_block};"
                await db.execute(delete_query, *params)

            # If it's a raw string
            elif isinstance(where_clause, str):
                delete_query = f"DELETE FROM {full_table_name} WHERE {where_clause};"
                await db.execute(delete_query)

            else:
                return {"error": "Invalid whereClause format."}

            return {"status_code": 200, "status":"OK", "message": "Records deleted successfully."}

    except Exception as e:
        return {"error": str(e)}
