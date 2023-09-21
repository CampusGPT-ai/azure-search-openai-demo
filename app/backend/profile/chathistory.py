import time
import uuid
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey
from azure.cosmos.database import DatabaseProxy
from azure.cosmos.container import ContainerProxy


CONTAINER_ID = "interactions"


class ChatHistory:

        # setup cosmos db connection
    _cosmos_client: cosmos_client.CosmosClient = None
    _cosmos_db: DatabaseProxy = None
    _cosmos_container: ContainerProxy = None


    @classmethod
    def configure(self, host, database, master_key):
        ChatHistory._cosmos_client = cosmos_client.CosmosClient(host, {'masterKey': master_key})
        ChatHistory._cosmos_db = ChatHistory._cosmos_client.create_database_if_not_exists(id=database)
        ChatHistory._cosmos_container = ChatHistory._cosmos_db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/id', kind='Hash'))


    @staticmethod
    def create_interaction_json(id, conversation_id, user_id, user_content, bot_content, timestamp=time.time()):
        message = {
            'id': id,
            'user_id': user_id,
            'timestamp': timestamp,
            'user' : user_content,
            'bot' : bot_content, 
            "conversation_id": conversation_id
        }
        return message


    @classmethod
    def create_interaction(self, conversation_id, user_id, user_content, bot_content):
        message = ChatHistory.create_interaction_json(
            id=str(uuid.uuid4()), 
            conversation_id=conversation_id, 
            user_id=user_id, 
            user_content=user_content, 
            bot_content=bot_content)
        ChatHistory._cosmos_container.create_item(body=message)

    @classmethod
    def load_by_conversation(self, conversation_id) -> [str]:
        # enable_cross_partition_query should be set to True as the container is partitioned
        items = list(ChatHistory._cosmos_container.query_items(
            query="SELECT * FROM interactions WHERE interactions.conversation_id=@id ORDER BY interactions.timestamp DESC",
            parameters=[
                {"name": "@id", "value": conversation_id}
            ],
            enable_cross_partition_query=True
        ))

        messages = []
        for item in items:
            messages.append(self.create_interaction_json(
                id=item.get("id"),
                conversation_id=item.get("conversation_id"), 
                user_id=item.get("user_id"), 
                user_content=item.get("user"), 
                bot_content=item.get("bot"), 
                timestamp=item.get("timestamp")
            ))
        
        return messages