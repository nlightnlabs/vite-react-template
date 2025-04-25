import os
import requests
import pandas as pd


token = os.getenv("OOMNITZA_DEMO_API_TOKEN")

def get_fields(object):
    url = f"https://labs.oomnitza.com/api/v3/{object}?limit=1"
    headers = {"Authorization2": token}
    try:
        response = requests.get(url, headers=headers)
        fields = dict(response.json()[0]).keys()
    except Exception as e:
        print(f"Error getting fields: {e}")
        return []
    return fields

def get_object(object):
    base_url = f"https://labs.oomnitza.com/api/v3/{object}"

    field_names = get_fields(object)
    verbose_query = ",".join(field_names)
    url = f"{base_url}?verbose={verbose_query}"
    headers = {"Authorization2": token}

    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        return data
    except Exception as e:
        print(f"Error getting object: {e}")
        return []


# Example usage:
if __name__ == "__main__":
    object = input("What object? ")
    try:
        results = pd.DataFrame(get_object(object))
        print(f"INFO:\n", results.info())
        print(f"SAMPLE:\n", results.sample(10))
        print(f"DESCRIBE:\n", results.describe())

        output_file_name = f"{object}.csv"
        results.to_csv(output_file_name, index=False)  # ✅ Proper way to save DataFrame to CSV
        print(f"\nData saved to {output_file_name}")

    except Exception as e:
        print(f"Error: {e}")
