import csv
import json

def csv_to_json(csv_filename, json_filename):
    # Create an empty list to store the rows
    data = []

    # Read the CSV file
    with open(csv_filename, 'r', encoding='utf-8-sig') as csvfile: # encoding='utf-8-sig' helps handle the BOM
        reader = csv.DictReader(csvfile)
        for row in reader:
            # remove the BOM from keys if present
            cleaned_row = {k.lstrip('\ufeff'): v for k, v in row.items()}
            data.append(cleaned_row)

    # Write the data to the JSON file
    with open(json_filename, 'w') as jsonfile:
        json.dump(data, jsonfile, indent=4)

csv_to_json(r'''C:\repos\azure-search-openai-demo\app\backend\data\conversation.csv''',"conversations.json")
