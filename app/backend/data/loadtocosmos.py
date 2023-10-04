import os
from azure.cosmos import CosmosClient, exceptions
import json
import uuid

# Provided connection details
AZURE_COSMOS_HOST = "https://{host}.documents.azure.com:443/".format(host=os.getenv("AZURE_COSMOS_HOST"))
AZURE_COSMOS_DB = os.getenv("AZURE_COSMOS_DB")
AZURE_COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")

# Initialize the Cosmos client
url = AZURE_COSMOS_HOST
key = AZURE_COSMOS_KEY
client = CosmosClient(url, credential=key)
database_name = AZURE_COSMOS_DB
database = client.get_database_client(database_name)
container_name = 'tqi'
container = database.get_container_client(container_name)

with open(r'C:\repos\azure-search-openai-demo\app\backend\data\topicInterestQuestions.json', 'r') as file:
    faq_json = json.load(file)
# Transform related_interests to a list of strings
for item in faq_json:
    item['id'] = str(uuid.uuid4())
    if item['related_interests']:
        item['related_interests'] = item['related_interests'].split(', ')
    else:
        item['related_interests'] = []

# Upload the transformed JSON document to Cosmos DB
for item in faq_json:
    try:
        container.upsert_item(item)
    except exceptions.CosmosHttpResponseError as e:
        print(f"Failed to upload item {item['question']}: {e}")

print(f"{len(faq_json)} items processed for upload to Cosmos DB")