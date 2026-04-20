#!/bin/bash

# Configuration
PROJECT_ID=${1:-"swiftseat-$(date +%m%d)"} # Use arg or fixed name
REGION="us-central1"
SERVICE_NAME="swiftseat-backend"

echo "🚀 Setting up Cloud Run for SwiftSeat (Project: $PROJECT_ID)..."
echo "⚠️  NOTE: Ensure billing is linked to $PROJECT_ID in console."

# 1. Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Not logged in. Run 'gcloud auth login' first."
    exit 1
fi

# 2. Check/Create Project
echo "📦 Checking project $PROJECT_ID..."
if ! gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
    echo "Creating project $PROJECT_ID..."
    gcloud projects create $PROJECT_ID --name="SwiftSeat"
fi
gcloud config set project $PROJECT_ID

# 3. Enable Services
echo "⚙️ Enabling Services..."
gcloud services enable run.googleapis.com \
                       artifactregistry.googleapis.com \
                       containerregistry.googleapis.com \
                       firestore.googleapis.com \
                       aiplatform.googleapis.com \
                       --quiet

# 4. Build and Deploy
echo "🛠️ Building and Deploying to Cloud Run..."
cd backend
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "GEMINI_API_KEY=$(grep GEMINI_API_KEY ../.env | cut -d'=' -f2 | tr -d '\"')" \
    --quiet

echo "✅ Deployment complete!"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
