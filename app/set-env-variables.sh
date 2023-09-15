#!/bin/sh

azd env set AZURE_SEARCH_SERVICE_RESOURCE_GROUP KWTestSept11 # rg-azure-search-openai-demo-dev"
azd env set AZURE_OPENAI_RESOURCE_GROUP KWTestSept11 # rg-azure-search-openai-demo-dev"

azd env set AZURE_SEARCH_SERVICE kwsearchtest # gptkb-b3yybe3qy5wiq
azd env set AZURE_SEARCH_INDEX fsuindex # gptkbindex
azd env set AZURE_OPENAI_SERVICE cog-b3yybe3qy5wiq  #KWAzureOpenAI
azd env set AZURE_OPENAI_CHATGPT_MODEL gpt-4-32k # gpt-35-turbo
azd env set AZURE_OPENAI_CHATGPT_DEPLOYMENT rschat   # chat
azd env set KB_FIELDS_SOURCEPAGE filepath # sourcepage
azd env set AZURE_RESOURCE_GROUP KWTestSept11 # rg-azure-search-openai-demo-dev
azd env set AZURE_STORAGE_ACCOUNT fsupdfs
azd env set AZURE_STORAGE_CONTAINER fileupload-fsuindex

# should be good
#AZURE_ENV_NAME="azure-search-openai-demo-dev"
#AZURE_LOCATION="eastus"
#AZURE_OPENAI_CHATGPT_DEPLOYMENT="chat"
#AZURE_OPENAI_EMB_DEPLOYMENT="embedding"
#AZURE_SUBSCRIPTION_ID="8868395e-bb54-41e0-93af-30556e84ab62"
#AZURE_TENANT_ID="4d51a850-1ed9-4747-86b5-d2a891921178"
#BACKEND_URI="https://app-backend-b3yybe3qy5wiq.azurewebsites.net"

# maybe change
#AZURE_RESOURCE_GROUP="rg-azure-search-openai-demo-dev"


# need to change
# resource groups
#AZURE_SEARCH_SERVICE_RESOURCE_GROUP="rg-azure-search-openai-demo-dev"
#AZURE_FORMRECOGNIZER_RESOURCE_GROUP="rg-azure-search-openai-demo-dev"
#AZURE_OPENAI_RESOURCE_GROUP="rg-azure-search-openai-demo-dev"
#AZURE_STORAGE_RESOURCE_GROUP="rg-azure-search-openai-demo-dev"

# other variables
#AZURE_OPENAI_CHATGPT_MODEL="gpt-35-turbo"
#AZURE_FORMRECOGNIZER_SERVICE="cog-fr-b3yybe3qy5wiq"
#AZURE_OPENAI_SERVICE="KWAzureOpenAI"
#AZURE_SEARCH_INDEX="gptkbindex"
#AZURE_SEARCH_SERVICE="gptkb-b3yybe3qy5wiq"
#AZURE_STORAGE_ACCOUNT="stb3yybe3qy5wiq"
#AZURE_STORAGE_CONTAINER="content"
