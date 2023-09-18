import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
from azure.cosmos import PartitionKey
from azure.cosmos.database import DatabaseProxy
from azure.cosmos.container import ContainerProxy
import uuid


CONTAINER_ID = "institutions"


class Institution:

    # setup cosmos db connection
    _cosmos_client: cosmos_client.CosmosClient = None
    _cosmos_db: DatabaseProxy = None
    _cosmos_container: ContainerProxy = None


    def __init__(self, id, name, logo):
        self.id = id
        self.name = name
        self.logo = logo

    @classmethod
    def configure(self, host, database, master_key):
        Institution._cosmos_client = cosmos_client.CosmosClient(host, {'masterKey': master_key})
        Institution._cosmos_db = Institution._cosmos_client.create_database_if_not_exists(id=database)
        Institution._cosmos_container =Institution._cosmos_db.create_container_if_not_exists(id=CONTAINER_ID, partition_key=PartitionKey(path='/id', kind='Hash'))

    @classmethod
    def create_if_not_exists(cls, id):
        # first see if we can load by the user_id, if not create a new one
        # this is a workaround since unique indexes are not working
        inst = Institution.load_by_id(id)
        if inst is None:
            inst = Institution(id, None, None)
        return inst
    

    @classmethod
    def load_by_id(cls, id):
        if id is None:
            return None
        
        inst = None
        try:
            inst = Institution._cosmos_container.read_item(item=id, partition_key=id)
        except exceptions.CosmosResourceNotFoundError:
            # leave inst as none
            inst = None

        return cls(
            inst.get("id"), 
            inst.get("name"),
            inst.get("logo"),
        ) if inst else None


    def save(self):
        Institution._cosmos_container.upsert_item(self.__dict__)