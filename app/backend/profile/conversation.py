import time
import uuid
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey
from azure.cosmos.database import DatabaseProxy
from azure.cosmos.container import ContainerProxy


CONTAINER_ID = "conversations"


class Conversation:

        # setup cosmos db connection
    _cosmos_client: cosmos_client.CosmosClient = None
    _cosmos_db: DatabaseProxy = None
    _cosmos_container: ContainerProxy = None

    def __init__(self, id, session_id, user_id, topic, start_time, end_time):
        self.id = id
        self.session_id = session_id
        self.user_id = user_id
        self.topic = topic
        self.start_time = start_time
        self.end_time = end_time
        self.isNew = False


    @classmethod
    def configure(self, host, database, master_key):
        Conversation._cosmos_client = cosmos_client.CosmosClient(host, {'masterKey': master_key})
        Conversation._cosmos_db = Conversation._cosmos_client.create_database_if_not_exists(id=database)
        Conversation._cosmos_container = Conversation._cosmos_db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/id', kind='Hash'))


    @classmethod
    def create_if_not_exists(cls, id, session_id, user_id):
        convo = cls.load_by_id(id)
        if convo is None:
            convo = cls(str(uuid.uuid4()), session_id, user_id, "", time.time() , None)
            convo.isNew = True
        return convo


    @classmethod
    def load_by_user(cls, user_id):
        items = list(Conversation._cosmos_container.query_items(
            query="SELECT * FROM conversations WHERE conversations.user_id=@id ORDER BY conversations.start_time DESC",
            parameters=[
                {"name": "@id", "value": user_id}
            ],
            enable_cross_partition_query=True
        ))

        convos = []
        for item in items:
           convos.append(cls(
            id=item.get("id"), 
            session_id=item.get("session_id"),
            user_id=item.get("user_id"),
            topic=item.get("topic"),
            start_time=item.get("start_time"),
            end_time=item.get("end_time"))
        )
        return convos
    
    @classmethod
    def load_by_id(cls, id):
        convo = None
        try:
            convo = cls._cosmos_container.read_item(item=id, partition_key=id)
        except exceptions.CosmosResourceNotFoundError:
            # leave as none
            convo = None

        return cls(
            id=convo.get("id"), 
            session_id=convo.get("session_id"),
            user_id=convo.get("user_id"),
            topic=convo.get("topic"),
            start_time=convo.get("start_time"),
            end_time=convo.get("end_time")
        ) if convo else None
    
    def save(self):
        Conversation._cosmos_container.upsert_item(self.__dict__)

    def to_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "topic": self.topic,
            "start_time": self.start_time,
            "end_time": self.end_time
        }