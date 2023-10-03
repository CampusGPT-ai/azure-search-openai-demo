from azure.cosmos import CosmosClient, exceptions
import csv, os

AZURE_COSMOS_HOST = "https://{host}.documents.azure.com:443/".format(host=os.getenv("AZURE_COSMOS_HOST"))
AZURE_COSMOS_DB = os.getenv("AZURE_COSMOS_DB")
AZURE_COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")

# Initialize the Cosmos client
url = AZURE_COSMOS_HOST
key = AZURE_COSMOS_KEY
client = CosmosClient(url, credential=key)
database_name = AZURE_COSMOS_DB
database = client.get_database_client(database_name)
container_name = 'conversations'
container = database.get_container_client(container_name)

# Function to update topic by item ID
def update_item_by_id(item_id, updates):
    try:
        # Read the current item
        item = container.read_item(item=item_id, partition_key=item_id)

        # Update the item's fields based on the provided updates
        for key, value in updates.items():
            item[key] = value

        # Replace the item with the updated content
        container.replace_item(item, item)
        print(f'Item with ID {item_id} updated successfully.')
    except exceptions.CosmosHttpResponseError as e:
        print(f'An error occurred: {e.message}')

# Read updates from CSV and apply
csv_file_path = "path_to_your_csv_file.csv"
with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
    reader = csv.DictReader(file)
    for row in reader:
        item_id = row['id']
        # Remove the 'id' key as we don't want to update the 'id'
        del row['id']
        update_item_by_id(item_id, row)
