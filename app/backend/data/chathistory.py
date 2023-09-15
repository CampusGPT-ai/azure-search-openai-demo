import time
import uuid
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey

# TODO: set as config values
DATABASE_ID = "chat-history"
CONTAINER_ID = "interactions"
HOST="https://demo-state-store.documents.azure.com:443/"
MASTER_KEY="'aRZkI4rpKmoQO6ZhXAH8VWyvlJFc68npe8lzBs4siTeovo6fTUxsNeFjnj0MBQL0Tv41YH3AhvmqACDbwZRDYA=="

class ChatHistory:

    def __init__(self):
        self.client = cosmos_client.CosmosClient(HOST, {'masterKey': MASTER_KEY})
        self.db = self.client.create_database_if_not_exists(id=DATABASE_ID)
        self.container = self.db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/userid', kind='Hash'))

    @staticmethod
    def get_interaction(user_id, user_content, bot_content):
        message = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'timestamp': time.time(),
            'user' : user_content,
            'bot' : bot_content
        }

        return message


    def create_interaction(self, user_id, user_content, bot_content):
        message = ChatHistory.get_interaction(user_id, user_content, bot_content)
        self.container.create_item(body=message)


    def load_message_by_user(self, user_id) -> [str]:
        # enable_cross_partition_query should be set to True as the container is partitioned
        items = list(self.container.query_items(
            query="SELECT * FROM interactions WHERE interactions.user_id=@id ORDER BY interactions.timestamp DESC",
            parameters=[
                {"name": "@id", "value": user_id}
            ],
            enable_cross_partition_query=True
        ))

        messages = []
        for item in items:
            messages.append(self.get_interaction(item.get("user_id"), item.get("user"), item.get("bot")))
        
        return messages