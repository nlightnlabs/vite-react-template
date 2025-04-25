
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID
import json
import ipaddress
import re
from dateutil import parser as date_parser


def to_int(value):
    return int(value) if value is not None and value != '' else None

def to_decimal(value):
    return Decimal(str(value)) if value is not None and value != '' else None

def to_float(value):
    return float(value) if value is not None and value != '' else None

def to_str(value):
    return str(value).strip() if value is not None else None

def to_bool(value):
    return str(value).lower() in ['true', 't', '1', 'yes'] if value is not None else None

def to_date(value):
    return datetime.strptime(value, '%Y-%m-%d').date() if value else None

def to_time(value):
    return datetime.strptime(value, '%H:%M:%S').time() if value else None

def to_timestamp(value):
    return date_parser.parse(value) if value else None

def to_timestamptz(value):
    return date_parser.parse(value) if value else None

def to_interval(value):
    match = re.match(r'(\d+)\s*(day|hour|minute|second)s?', value.lower()) if value else None
    if not match: return None
    num, unit = int(match[1]), match[2]
    return timedelta(**{f"{unit}s": num})

def to_json(value):
    if value is None:
        return None

    if isinstance(value, (dict, list)):
        return json.dumps(value)

    if isinstance(value, str):
        try:
            json.loads(value)  # Ensure it's valid JSON
            return value
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON string passed: {value}")

    raise ValueError(f"Unsupported type for JSON field: {type(value)}")

    # Fallback: try to dump any other primitive
    return json.dumps(value)

def to_bytes(value):
    return bytes(value, 'utf-8') if isinstance(value, str) else value

def to_uuid(value):
    return UUID(str(value)) if value else None

def to_ip(value):
    return ipaddress.ip_address(value) if value else None

def to_cidr(value):
    return ipaddress.ip_network(value, strict=False) if value else None

def to_mac(value):
    if isinstance(value, str) and re.match(r'^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$', value):
        return value
    return None

def to_enum(value):
    return str(value).strip() if value else None

postgres_type_map = [
  {
    "data_type": "smallint",
    "converter": "to_int",
    "description": "2-byte integer",
    "example_input": "42"
  },
  {
    "data_type": "integer",
    "converter": "to_int",
    "description": "4-byte integer",
    "example_input": "42"
  },
  {
    "data_type": "bigint",
    "converter": "to_int",
    "description": "8-byte integer",
    "example_input": "42"
  },
  {
    "data_type": "decimal",
    "converter": "to_decimal",
    "description": "Exact numeric with precision and scale",
    "example_input": "1234.56"
  },
  {
    "data_type": "numeric",
    "converter": "to_decimal",
    "description": "Exact numeric with precision and scale",
    "example_input": "1234.56"
  },
  {
    "data_type": "real",
    "converter": "to_float",
    "description": "4-byte floating point",
    "example_input": "3.14159"
  },
  {
    "data_type": "double precision",
    "converter": "to_float",
    "description": "8-byte floating point",
    "example_input": "3.14159"
  },
  {
    "data_type": "serial",
    "converter": "to_int",
    "description": "Auto-incrementing 4-byte integer",
    "example_input": "42"
  },
  {
    "data_type": "bigserial",
    "converter": "to_int",
    "description": "Auto-incrementing 8-byte integer",
    "example_input": "42"
  },
  {
    "data_type": "char",
    "converter": "to_str",
    "description": "Fixed-length string",
    "example_input": "hello world"
  },
  {
    "data_type": "varchar",
    "converter": "to_str",
    "description": "Variable-length string",
    "example_input": "hello world"
  },
   {
    "data_type": "varchar",
    "converter": "to_str",
    "description": "Unlimited length string",
    "example_input": "42"
  },
   {
    "data_type": "char",
    "converter": "to_str",
    "description": "Unlimited length string",
    "example_input": "42"
  },
  {
    "data_type": "text",
    "converter": "to_str",
    "description": "Unlimited length string",
    "example_input": "hello world"
  },
  {
    "data_type": "boolean",
    "converter": "to_bool",
    "description": "Boolean value",
    "example_input": "true"
  },
  {
    "data_type": "date",
    "converter": "to_date",
    "description": "Calendar date (YYYY-MM-DD)",
    "example_input": "2024-12-31"
  },
  {
    "data_type": "time",
    "converter": "to_time",
    "description": "Time of day (HH:MM:SS)",
    "example_input": "13:45:00"
  },
  {
    "data_type": "timestamp",
    "converter": "to_timestamp",
    "description": "Date and time (no timezone)",
    "example_input": "2024-12-31 13:45:00"
  },
  {
    "data_type": "timestamp with time zone",
    "converter": "to_timestamptz",
    "description": "Date and time with timezone",
    "example_input": "2024-12-31T13:45:00+00:00"
  },
  {
    "data_type": "interval",
    "converter": "to_interval",
    "description": "Time span (e.g., 2 days, 3 hours)",
    "example_input": "2 days"
  },
  {
    "data_type": "json",
    "converter": "to_json",
    "description": "Textual JSON",
    "example_input": "{\"name\": \"Alice\", \"age\": 30}"
  },
  {
    "data_type": "jsonb",
    "converter": "to_json",
    "description": "Binary JSON",
    "example_input": "{\"name\": \"Alice\", \"age\": 30}"
  },
  {
    "data_type": "bytea",
    "converter": "to_bytes",
    "description": "Binary data",
    "example_input": "binarydata"
  },
  {
    "data_type": "uuid",
    "converter": "to_uuid",
    "description": "Universally Unique Identifier",
    "example_input": "550e8400-e29b-41d4-a716-446655440000"
  },
  {
    "data_type": "inet",
    "converter": "to_ip",
    "description": "IP address (IPv4/IPv6)",
    "example_input": "192.168.1.1"
  },
  {
    "data_type": "cidr",
    "converter": "to_cidr",
    "description": "IP network",
    "example_input": "192.168.1.0/24"
  },
  {
    "data_type": "macaddr",
    "converter": "to_mac",
    "description": "MAC address",
    "example_input": "AA:BB:CC:DD:EE:FF"
  },
  {
    "data_type": "enum",
    "converter": "to_enum",
    "description": "User-defined enum values",
    "example_input": "active"
  },
]


def normalize_postgres_type(data_type: str) -> str:
    """
    Normalize Postgres type strings like 'varchar(255)' to 'varchar'.
    """
    if not data_type:
        return ""
    data_type = data_type.lower().strip()
    # Strip type parameters, e.g. varchar(255), char(10)
    match = re.match(r"^([a-z ]+)", data_type)
    return match.group(1).strip() if match else data_type


def convert_data_type(value, data_type):
    normalized_type = normalize_postgres_type(data_type)
    for item in postgres_type_map:
        if item.get("data_type") == normalized_type:
            func_name = item["converter"]
            func = globals().get(func_name)
            if callable(func):
                return func(value)
            else:
                raise ValueError(f"Converter function '{func_name}' not found.")
    raise ValueError(f"Unsupported data_type '{data_type}'")


        
if __name__ == "__main__":
    value = input("value: ")
    data_type = input("data_type: ")
    try:
        converted_value = convert_data_type(value, data_type)
        print("Converted Value:", converted_value, type(converted_value))
    except Exception as e:
        print("Error:", e)
