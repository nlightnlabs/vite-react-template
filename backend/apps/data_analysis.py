import pandas as pd
import numpy as np
from api import get_object

# Set the option to display all columns
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1200)

# Set the option to display all rows (optional)
# pd.set_option('display.max_rows', None)


# Sample data
data = [
    {'id': 1, "date":"2024-01-14", 'category': 'A', 'spend': 1000, "tax_rate":0.05, "supplier":"Supplier 1"},
    {'id': 2, "date":"2024-02-10", 'category': 'B', 'spend': 500, "tax_rate":0.01, "supplier":"Supplier 2"},
    {'id': 3, "date":"2024-03-23", 'category': 'A', 'spend': 750, "tax_rate":0.02, "supplier":"Supplier 3"},
    {'id': 4, "date":"2024-04-08", 'category': 'C', 'spend': 200, "tax_rate":0.03, "supplier":"Supplier 3"},
    {'id': 5, "date":"2024-05-07", 'category': 'A', 'spend': 434, "tax_rate":0.08, "supplier":"Supplier 2"},
    {'id': 6, "date":"2024-06-12", 'category': 'B', 'spend': 732, "tax_rate":0.09, "supplier":"Supplier 1"},
    {'id': 7, "date":"2024-07-15", 'category': 'A', 'spend': 820, "tax_rate":0.1, "supplier":"Supplier 4"},
    {'id': 8, "date":"2024-08-21", 'category': 'C', 'spend': 123, "tax_rate":0.07, "supplier":"Supplier 5"},
    {'id': 9, "date":"2024-09-13", 'category': 'A', 'spend': 3023, "tax_rate":0.03, "supplier":"Supplier 3"},
    {'id': 10, "date":"2024-10-06", 'category': 'D', 'spend': 343, "tax_rate":0.05, "supplier":"Supplier 1"},
    {'id': 11, "date":"2024-01-10", 'category': 'A', 'spend': 1000, "tax_rate":0.05, "supplier":"Supplier 1"},
    {'id': 12, "date":"2024-01-13", 'category': 'B', 'spend': 500, "tax_rate":0.01, "supplier":"Supplier 2"},
    {'id': 13, "date":"2024-03-19", 'category': 'A', 'spend': 750, "tax_rate":0.02, "supplier":"Supplier 3"},
    {'id': 14, "date":"2024-05-21", 'category': 'C', 'spend': 200, "tax_rate":0.03, "supplier":"Supplier 3"},
    {'id': 15, "date":"2024-05-14", 'category': 'A', 'spend': 434, "tax_rate":0.08, "supplier":"Supplier 2"},
    {'id': 16, "date":"2024-05-21", 'category': 'B', 'spend': 732, "tax_rate":0.09, "supplier":"Supplier 1"},
    {'id': 17, "date":"2024-07-06", 'category': 'A', 'spend': 820, "tax_rate":0.1, "supplier":"Supplier 4"},
    {'id': 18, "date":"2024-08-14", 'category': 'C', 'spend': 123, "tax_rate":0.07, "supplier":"Supplier 5"},
    {'id': 19, "date":"2024-11-09", 'category': 'A', 'spend': 3023, "tax_rate":0.03, "supplier":"Supplier 3"},
    {'id': 20, "date":"2024-12-01", 'category': 'D', 'spend': 343, "tax_rate":0.05, "supplier":"Supplier 1"}
]



def analyze_field(data, groupby_field, value_field):
    df =data

    # Ensure value field is numeric
    df[value_field] = df[value_field].astype(float)

    # Group by the groupby_field and aggregate the value_field
    aggregated_df = df.groupby(groupby_field, as_index=False)[value_field].agg(
        count='count',
        total_value='sum',
        average='mean',
        median='median',
        min='min',
        max='max'
    )

    # Calculate additional metrics
    aggregated_df["std_dev"] = np.where(aggregated_df["count"] > 1, df.groupby(groupby_field)[value_field].std().values, 0)
    aggregated_df["%_of_total_value"] = aggregated_df["total_value"] / aggregated_df["total_value"].sum()
    aggregated_df["running_%_of_total_value"] = aggregated_df["%_of_total_value"].cumsum() * 100

    aggregated_df["avg_%_from_median"] = (aggregated_df["average"] / aggregated_df["median"] - 1) * 100
    aggregated_df["avg_%_from_overall_avg"] = (aggregated_df["average"] / aggregated_df["average"].mean() - 1) * 100
    aggregated_df["median_%_from_overall_median"] = (aggregated_df["median"] / aggregated_df["median"].median() - 1) * 100

    # Reorder the columns while ensuring the groupby_field appears only once
    aggregated_df = aggregated_df[[
        groupby_field,
        "count",
        "min",
        "max",
        "total_value",
        "%_of_total_value",
        "running_%_of_total_value",
        "average",
        "median",
        "std_dev",
        "avg_%_from_median",
        "avg_%_from_overall_avg",
        "median_%_from_overall_median"
    ]]

    aggregated_df.sort_values(by="total_value", ascending=False, inplace=True)

    # print(aggregated_df)

    overall_summary = { 
        "count": aggregated_df["count"].sum(),
        "min":  aggregated_df["min"].min(),
        "max": aggregated_df["max"].max(),
        "total_value": aggregated_df["total_value"].sum(),
        "average": aggregated_df["average"].mean(),
        "median": aggregated_df["median"].median(),
        "std_dev": aggregated_df["count"].std(),
        "avg_%_from_median":  aggregated_df["avg_%_from_median"].mean(),
        "avg_%_from_overall_avg":  aggregated_df["avg_%_from_overall_avg"].mean(),
        "median_%_from_overall_median":  aggregated_df["median_%_from_overall_median"].mean()
    }

    category_summary = aggregated_df.to_json(orient='records') 
    
    return {
        "category_summary":category_summary, 
        "overall_summary":overall_summary
    }



def correlate(data, features):
    data = pd.DataFrame(data)

    numerical_features = data.select_dtypes(include=[np.number])
    print(numerical_features)

    if features and len(features)>0:
        numerical_features = numerical_features[features]

    correlation_matrix =  numerical_features.corr()
    correlation_maxtrix_df = pd.DataFrame(correlation_matrix)

    # Flatten the dataframe
    correlation_data_flattened = correlation_matrix.stack().reset_index()
    correlation_data_flattened.columns = ['Feature 1', 'Feature 2', 'Correlation']

    # Remove the diagonals and duplicate feature combinations
    correlation_data_flattened = correlation_data_flattened[correlation_data_flattened['Feature 1'] != correlation_data_flattened['Feature 2']]
    correlation_data_flattened['features'] = correlation_data_flattened.apply(
        lambda row: tuple(sorted([row['Feature 1'], row['Feature 2']])), axis=1
    )
    correlation_data_flattened = correlation_data_flattened.drop_duplicates(subset='features')

    # Sort by correlation value
    correlation_data_flattened.sort_values(by='Correlation', ascending=False, inplace=True)
    correlation_data_flattened["Features"] = correlation_data_flattened["Feature 1"] + " & " + correlation_data_flattened["Feature 2"]

    # Drop the 'features' column as it was only needed for deduplication
    correlation_data_flattened = correlation_data_flattened.drop(columns='features')
    correlation_data_flattened.reset_index(drop=True, inplace=True)

    correlation_summary = {
        "correlation_maxtrix": correlation_maxtrix_df.to_json(),
        "correlation_table": correlation_data_flattened.to_json()
    }

    return correlation_summary




if __name__ == "__main__":
    object = input("Select an object: ")

    try:
        data = pd.DataFrame(get_object(object))
        field_analysis = analyze_field(data, "status", "residual")
        print(field_analysis)
    except Exception as e:
        print(f"Error: {e}")