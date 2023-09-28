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
azd env set AZURE_LOCATION eastus
azd env set  AZURE_ENV_NAME azure-search-openai-demo-dev
azd env set AZURE_FORMRECOGNIZER_RESOURCE_GROUP rg-azure-search-openai-demo-dev
azd env set AZURE_FORMRECOGNIZER_SERVICE cog-fr-b3yybe3qy5wiq
azd env set AZURE_OPENAI_EMB_DEPLOYMENT embedding
azd env set AZURE_STORAGE_RESOURCE_GROUP rg-azure-search-openai-demo-dev
azd env set AZURE_SUBSCRIPTION_ID 8868395e-bb54-41e0-93af-30556e84ab62
azd env set AZURE_TENANT_ID 4d51a850-1ed9-4747-86b5-d2a891921178
azd env set BACKEND_URI https://app-backend-b3yybe3qy5wiq.azurewebsites.net

azd env set AZURE_COSMOS_HOST demo-state-store
azd env set AZURE_COSMOS_DB data
azd env set AZURE_COSMOS_KEY HshGK5tUYkZY2UIkXDvWhPOGX6xUhAuEqWykoYP1OXAzSeCdxLG1
azd env set CURRENT_INSTITUTION fsu
azd env set CURRENT_USER rstaudinger
