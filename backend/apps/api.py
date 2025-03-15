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
        print(e)
    return fields

def get_object(object):
    
    base_url = f"https://labs.oomnitza.com/api/v3/{object}"

    field_names = get_fields(object)
    verbose_query = ",".join(field_names)
    url = f"{base_url}?verbose={verbose_query}"
    headers = {"Authorization2": token}

    try:
        response = requests.get(url, headers=headers)
        data  = response.json()
        return data
        # df = pd.DataFrame(data)
        # df.to_csv(f"../data/{object}.csv", index=False)  # Save CSV without the index column
    except Exception as e:
        print(f"Error: {e}")
        return e


# Example usage:
if __name__ == "__main__":
    object = input("What object? ")
    try:
        results = pd.DataFrame(get_object(object))
        print(f"INFO:\n",results.info())
        print(f"SAMPLE:\n",results.sample(10))
        print(f"DESCRIBE:\n",results.describe)
    except Exception as e:
        print(f"Error: {e}")

