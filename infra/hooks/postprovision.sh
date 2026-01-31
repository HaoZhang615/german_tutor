#!/usr/bin/env bash
# Post-provision hook to populate .env file with Azure resource values

set -e

echo -e "\033[0;36mRunning post-provision hook to populate .env file...\033[0m"

# Get azd environment values and parse KEY="VALUE" format
declare -A env_values
while IFS='=' read -r key value; do
    # Remove quotes from value
    value="${value%\"}"
    value="${value#\"}"
    env_values["$key"]="$value"
done < <(azd env get-values)

# Define the .env file path (repo root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../../.env"

# Create .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo -e "\033[0;33mCreating new .env file...\033[0m"
    cp "$SCRIPT_DIR/../../.env.example" "$ENV_FILE"
fi

# Function to update or add environment variable
update_env_var() {
    local name="$1"
    local value="${env_values[$name]}"
    
    if [ -z "$value" ]; then
        echo -e "\033[0;90m  Skipping $name (no value provided)\033[0m"
        return
    fi
    
    if grep -q "^$name=" "$ENV_FILE"; then
        echo -e "\033[0;32m  Updating $name\033[0m"
        sed -i.bak "s|^$name=.*|$name=$value|" "$ENV_FILE"
    else
        echo -e "\033[0;32m  Adding $name\033[0m"
        echo "$name=$value" >> "$ENV_FILE"
    fi
}

# Update Azure OpenAI configuration
update_env_var "AZURE_OPENAI_ENDPOINT"
update_env_var "AZURE_OPENAI_REALTIME_DEPLOYMENT"
update_env_var "AZURE_OPENAI_TTS_DEPLOYMENT"

# Update CosmosDB configuration
update_env_var "COSMOSDB_ENDPOINT"
update_env_var "COSMOSDB_DATABASE"
update_env_var "COSMOSDB_CONVERSATIONS_CONTAINER"
update_env_var "COSMOSDB_SCENARIOS_CONTAINER"

# Update frontend URL
update_env_var "FRONTEND_URL"

# Remove backup file if created
rm -f "$ENV_FILE.bak"

echo ""
echo -e "\033[0;32m✓ .env file updated successfully!\033[0m"
echo -e "\033[0;90m  Location: $ENV_FILE\033[0m"
echo ""
echo -e "\033[0;36mDeployment complete!\033[0m"
echo -e "\033[0;33mFrontend URL: ${env_values['FRONTEND_URL']}\033[0m"
echo -e "\033[0;33mBackend URL: ${env_values['BACKEND_URL']}\033[0m"
