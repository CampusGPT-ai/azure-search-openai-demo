#!/bin/sh

azd env set AZURE_RESOURCE_GROUP KWTestSept11
azd env set AZURE_SEARCH_SERVICE_RESOURCE_GROUP KWTestSept11
azd env set AZURE_OPENAI_RESOURCE_GROUP KWTestSept11

azd env set AZURE_SEARCH_SERVICE kwsearchtest
azd env set AZURE_SEARCH_SERVICE_KEY HshGK5tUYkZY2UIkXDvWhPOGX6xUhAuEqWykoYP1OXAzSeCdxLG1
azd env set AZURE_SEARCH_INDEX fsuindex

azd env set AZURE_OPENAI_SERVICE cog-b3yybe3qy5wiq
azd env set AZURE_OPENAI_CHATGPT_MODEL gpt-4-32k
azd env set AZURE_OPENAI_CHATGPT_DEPLOYMENT rschat

azd env set KB_FIELDS_SOURCEPAGE filepath

azd env set AZURE_STORAGE_ACCOUNT fsupdfs
azd env set AZURE_STORAGE_ACCOUNT_CRED ?sv=2022-11-02\&ss=bfqt\&srt=sco\&sp=rwdlacupyx\&se=2025-01-02T00:31:31Z\&st=2023-09-13T16:31:31Z\&spr=https\&sig=bEtJcUhkuwNxscObZP0W7mvOs4XKzL1Jtw5SyfO7oMw%3D
azd env set AZURE_STORAGE_CONTAINER fileupload-fsuindex

azd env set AZURE_COSMOS_HOST demo-state-store
azd env set AZURE_COSMOS_DB data
azd env set AZURE_COSMOS_KEY \'aRZkI4rpKmoQO6ZhXAH8VWyvlJFc68npe8lzBs4siTeovo6fTUxsNeFjnj0MBQL0Tv41YH3AhvmqACDbwZRDYA==

azd env set CURRENT_INSTITUTION fsu
azd env set CURRENT_USER rstaudinger
