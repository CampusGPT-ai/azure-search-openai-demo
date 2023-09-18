import io
import logging
import mimetypes
import os
import time


import aiohttp
import openai
from azure.core.credentials import AzureKeyCredential, AzureSasCredential
from azure.identity.aio import DefaultAzureCredential
from azure.monitor.opentelemetry import configure_azure_monitor
from azure.search.documents.aio import SearchClient
from azure.storage.blob.aio import BlobServiceClient
from opentelemetry.instrumentation.aiohttp_client import AioHttpClientInstrumentor
from opentelemetry.instrumentation.asgi import OpenTelemetryMiddleware
from quart import (
    Blueprint,
    Quart,
    abort,
    current_app,
    jsonify,
    request,
    send_file,
    send_from_directory,
)

from approaches.chatreadretrieveread import ChatReadRetrieveReadApproach
from approaches.readdecomposeask import ReadDecomposeAsk
from approaches.readretrieveread import ReadRetrieveReadApproach
from approaches.retrievethenread import RetrieveThenReadApproach
from profile.interest import Interest
from profile.profile import Profile
from profile.institution import Institution
from profile.chathistory import ChatHistory

CONFIG_OPENAI_TOKEN = "openai_token"
CONFIG_CREDENTIAL = "azure_credential"
CONFIG_ASK_APPROACHES = "ask_approaches"
CONFIG_CHAT_APPROACHES = "chat_approaches"
CONFIG_BLOB_CONTAINER_CLIENT = "blob_container_client"
CONFIG_CURRENT_INSTITUTION = "current_institution"
CONFIG_CURRENT_USER = "current_user"


bp = Blueprint("routes", __name__, static_folder='static')

@bp.route("/")
async def index():
    return await bp.send_static_file("index.html")

@bp.route("/favicon.ico")
async def favicon():
    return await bp.send_static_file("favicon.ico")

@bp.route("/assets/<path:path>")
async def assets(path):
    return await send_from_directory("static/assets", path)

# Serve content files from blob storage from within the app to keep the example self-contained.
# *** NOTE *** this assumes that the content files are public, or at least that all users of the app
# can access all the files. This is also slow and memory hungry.
@bp.route("/content/<path>")
async def content_file(path):
    blob_container_client = current_app.config[CONFIG_BLOB_CONTAINER_CLIENT]
    blob = await blob_container_client.get_blob_client(path).download_blob()
    if not blob.properties or not blob.properties.has_key("content_settings"):
        abort(404)
    mime_type = blob.properties["content_settings"]["content_type"]
    if mime_type == "application/octet-stream":
        mime_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    blob_file = io.BytesIO()
    await blob.readinto(blob_file)
    blob_file.seek(0)
    return await send_file(blob_file, mimetype=mime_type, as_attachment=False, attachment_filename=path)

@bp.route("/ask", methods=["POST"])
async def ask():
    if not request.is_json:
        return jsonify({"error": "request must be json"}), 415
    request_json = await request.get_json()
    approach = request_json["approach"]
    try:
        impl = current_app.config[CONFIG_ASK_APPROACHES].get(approach)
        if not impl:
            return jsonify({"error": "unknown approach"}), 400
        # Workaround for: https://github.com/openai/openai-python/issues/371
        async with aiohttp.ClientSession() as s:
            openai.aiosession.set(s)
            r = await impl.run(request_json["question"], request_json.get("overrides") or {})
        return jsonify(r)
    except Exception as e:
        logging.exception("Exception in /ask")
        return jsonify({"error": str(e)}), 500

@bp.route("/chat", methods=["POST"])
async def chat():
    if not request.is_json:
        return jsonify({"error": "request must be json"}), 415
    request_json = await request.get_json()
    approach = request_json["approach"]
    try:
        impl = current_app.config[CONFIG_CHAT_APPROACHES].get(approach)
        if not impl:
            return jsonify({"error": "unknown approach"}), 400
        # Workaround for: https://github.com/openai/openai-python/issues/371
        async with aiohttp.ClientSession() as s:
            openai.aiosession.set(s)
            r = await impl.run(request_json["history"], request_json.get("overrides") or {})
        return jsonify(r)
    except Exception as e:
        logging.exception("Exception in /chat")
        return jsonify({"error": str(e)}), 500

@bp.route("/interests", methods=["GET"])
async def get_all_interests() :
    data = []
    data.append(Interest("Team sports", 0).to_json())
    data.append(Interest("Outdoor activities", 0).to_json())
    data.append(Interest("Music", 0).to_json())
    data.append(Interest("Performing Arts", 0).to_json())
    data.append(Interest("Film", 0).to_json())
    data.append(Interest("Health & Wellness", 0).to_json())
    data.append(Interest("History", 0).to_json())
    data.append(Interest("Gaming", 0).to_json())
    data.append(Interest("Greek Life", 0).to_json())
    data.append(Interest("Equity, Diversity, and Inclusion", 0).to_json())
    data.append(Interest("Technology", 0).to_json())

    #create new institution
    inst = Institution.create_if_not_exists("fsu")
    inst.name = "Florida State University"
    inst.logo = "/logos/fsu.png"
    inst.save() 

    #create new profile
    profile = Profile.create_if_not_exists("rstaudinger", inst.id)
    profile.save()

    loaded_profile = Profile.load_by_id(profile.id)
    loaded_profile.minor = "Theoretical Physics"
    loaded_profile.save()

    chatHistory = ChatHistory.load_message_by_user(profile.user_id)

    return jsonify({"list": data})


@bp.before_request
async def ensure_openai_token():
    openai_token = current_app.config[CONFIG_OPENAI_TOKEN]
    if openai_token.expires_on < time.time() + 60:
        openai_token = await current_app.config[CONFIG_CREDENTIAL].get_token("https://cognitiveservices.azure.com/.default")
        current_app.config[CONFIG_OPENAI_TOKEN] = openai_token
        openai.api_key = openai_token.token

@bp.before_app_serving
async def setup_clients():

    # Replace these with your own values, either in environment variables or directly here
    AZURE_STORAGE_ACCOUNT = os.getenv("AZURE_STORAGE_ACCOUNT")
    AZURE_STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER")
    AZURE_SEARCH_SERVICE = os.getenv("AZURE_SEARCH_SERVICE")
    AZURE_SEARCH_INDEX = os.getenv("AZURE_SEARCH_INDEX")
    AZURE_OPENAI_SERVICE = os.getenv("AZURE_OPENAI_SERVICE")
    AZURE_OPENAI_CHATGPT_DEPLOYMENT = os.getenv("AZURE_OPENAI_CHATGPT_DEPLOYMENT")
    AZURE_OPENAI_CHATGPT_MODEL = os.getenv("AZURE_OPENAI_CHATGPT_MODEL")
    AZURE_OPENAI_EMB_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMB_DEPLOYMENT")

    AZURE_COSMOS_HOST = "https://{host}.documents.azure.com:443/".format(host=os.getenv("AZURE_COSMOS_HOST"))
    AZURE_COSMOS_DB = os.getenv("AZURE_COSMOS_DB")
    AZURE_COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")

    KB_FIELDS_CONTENT = os.getenv("KB_FIELDS_CONTENT", "content")
    KB_FIELDS_SOURCEPAGE = os.getenv("KB_FIELDS_SOURCEPAGE", "sourcepage")

    CURRENT_INSTITUTION = os.getenv("CURRENT_INSTITUTION")
    CURRENT_USER = os.getenv("CURRENT_USER")

    # Use the current user identity to authenticate with Azure OpenAI, Cognitive Search and Blob Storage (no secrets needed,
    # just use 'az login' locally, and managed identity when deployed on Azure). If you need to use keys, use separate AzureKeyCredential instances with the
    # keys for each service
    # If you encounter a blocking error during a DefaultAzureCredential resolution, you can exclude the problematic credential by using a parameter (ex. exclude_shared_token_cache_credential=True)
    azure_credential = DefaultAzureCredential(exclude_shared_token_cache_credential = True)

    # Set up clients for Cognitive Search and Storage
    search_client = SearchClient(
        endpoint=f"https://{AZURE_SEARCH_SERVICE}.search.windows.net",
        index_name=AZURE_SEARCH_INDEX,
        credential=AzureKeyCredential("UjyJz7CV76kDI1w8ub6IhIQqNtQ4e1a106jXAWhkbSAzSeC9dStf"))
    blob_client = BlobServiceClient(
        account_url=f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net",
        credential=AzureSasCredential("?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupyx&se=2025-01-02T00:31:31Z&st=2023-09-13T16:31:31Z&spr=https&sig=bEtJcUhkuwNxscObZP0W7mvOs4XKzL1Jtw5SyfO7oMw%3D"))
    blob_container_client = blob_client.get_container_client(AZURE_STORAGE_CONTAINER)

    # Used by the OpenAI SDK
    openai.api_base = f"https://{AZURE_OPENAI_SERVICE}.openai.azure.com"
    openai.api_version = "2023-05-15"
    openai.api_type = "azure_ad"
    openai_token = await azure_credential.get_token(
        "https://cognitiveservices.azure.com/.default"
    )
    openai.api_key = openai_token.token

    # Store on app.config for later use inside requests
    current_app.config[CONFIG_OPENAI_TOKEN] = openai_token
    current_app.config[CONFIG_CREDENTIAL] = azure_credential
    current_app.config[CONFIG_BLOB_CONTAINER_CLIENT] = blob_container_client

    # setup persistence handlers and 
    Institution.configure(AZURE_COSMOS_HOST, AZURE_COSMOS_DB, AZURE_COSMOS_KEY)
    Profile.configure(AZURE_COSMOS_HOST, AZURE_COSMOS_DB, AZURE_COSMOS_KEY)
    ChatHistory.configure(AZURE_COSMOS_HOST, AZURE_COSMOS_DB, AZURE_COSMOS_KEY)


    # Various approaches to integrate GPT and external knowledge, most applications will use a single one of these patterns
    # or some derivative, here we include several for exploration purposes
    current_app.config[CONFIG_ASK_APPROACHES] = {
        "rtr": RetrieveThenReadApproach(
            search_client,
            AZURE_OPENAI_CHATGPT_DEPLOYMENT,
            AZURE_OPENAI_CHATGPT_MODEL,
            AZURE_OPENAI_EMB_DEPLOYMENT,
            KB_FIELDS_SOURCEPAGE,
            KB_FIELDS_CONTENT
        ),
        "rrr": ReadRetrieveReadApproach(
            search_client,
            AZURE_OPENAI_CHATGPT_DEPLOYMENT,
            AZURE_OPENAI_EMB_DEPLOYMENT,
            KB_FIELDS_SOURCEPAGE,
            KB_FIELDS_CONTENT
        ),
        "rda": ReadDecomposeAsk(search_client,
            AZURE_OPENAI_CHATGPT_DEPLOYMENT,
            AZURE_OPENAI_EMB_DEPLOYMENT,
            KB_FIELDS_SOURCEPAGE,
            KB_FIELDS_CONTENT
        )
    }
    current_app.config[CONFIG_CHAT_APPROACHES] = {
        "rrr": ChatReadRetrieveReadApproach(
            search_client,
            Institution.load_by_id(CURRENT_INSTITUTION),
            Profile.load_by_user_id(CURRENT_USER),
            AZURE_OPENAI_CHATGPT_DEPLOYMENT,
            AZURE_OPENAI_CHATGPT_MODEL,
            AZURE_OPENAI_EMB_DEPLOYMENT,
            KB_FIELDS_SOURCEPAGE,
            KB_FIELDS_CONTENT,
        )
    }


def create_app():
    if os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"):
        configure_azure_monitor()
        AioHttpClientInstrumentor().instrument()
    app = Quart(__name__)
    app.register_blueprint(bp)
    app.asgi_app = OpenTelemetryMiddleware(app.asgi_app)

    return app
