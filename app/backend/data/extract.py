import csv, os
from azure.cosmos import CosmosClient, exceptions

AZURE_COSMOS_HOST = "https://{host}.documents.azure.com:443/".format(host=os.getenv("AZURE_COSMOS_HOST"))
AZURE_COSMOS_DB = os.getenv("AZURE_COSMOS_DB")
AZURE_COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")



# Initialize the Cosmos client
url = AZURE_COSMOS_HOST
key = AZURE_COSMOS_KEY
client = CosmosClient(url, credential=key)
database_name = AZURE_COSMOS_DB
database = client.get_database_client(database_name)
container_name = 'profiles'
container = database.get_container_client(container_name)

# Function to extract all items and save to CSV
def extract_to_csv(filename):
    # Retrieve all items first to find all possible keys
    all_items = list(container.query_items(query="SELECT * FROM p", enable_cross_partition_query=True))
    all_keys = set().union(*(item.keys() for item in all_items))
    
    # Open CSV for writing
    with open(filename, 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=all_keys)
        writer.writeheader()
        for item in all_items:
            writer.writerow(item)
    print(f"Data extracted to {filename}")

# Extract data to CSV
extract_to_csv('output.csv')