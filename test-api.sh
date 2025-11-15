#!/bin/bash
# Test script for emotion analytics API
# Usage: ./test-api.sh [meetingId]

MEETING_ID=${1:-"test_meeting"}
BACKEND_URL="http://localhost:5000"

echo "Testing Emotion API with meeting ID: $MEETING_ID"
echo "--------------------------------------------"

# Test the API directly
echo "GET $BACKEND_URL/api/emotion-analytics/emotion/$MEETING_ID"
curl -s "$BACKEND_URL/api/emotion-analytics/emotion/$MEETING_ID" | jq || echo "Error: API returned non-JSON response"

echo ""
echo "If you see valid JSON above, the API is working correctly!"
echo "If not, check that the backend server is running and the route exists."
