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

azd env set AZURE_COSMOS_HOST demo-state-store
azd env set AZURE_COSMOS_DB data
azd env set AZURE_COSMOS_KEY \'aRZkI4rpKmoQO6ZhXAH8VWyvlJFc68npe8lzBs4siTeovo6fTUxsNeFjnj0MBQL0Tv41YH3AhvmqACDbwZRDYA==
azd env set CURRENT_INSTITUTION fsu
azd env set CURRENT_USER rstaudinger
