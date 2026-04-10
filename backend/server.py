import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS so our frontend can call the API when running on different localhost ports
CORS(app)

# Configure Gemini API
GENAI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)
else:
    print("\n[WARNING] No GEMINI_API_KEY found in .env. The API will return mocked responses.\n")

# Define our Function Calling tools for the AI
def get_optimal_route(food_category: str):
    """
    Finds the optimal path and concession stand for the user based on wait times and walk times.
    Call this when the user says they are hungry, or want a specific food category (e.g. 'burger', 'drink').
    """
    return f"Triggered routing for {food_category}"

def place_order(stand_id: str, item: str):
    """
    Places a food order at a specific stand, and pushes a digital voucher to Google Wallet.
    Call this if the user confirms they want to order from the recommended stand.
    """
    return f"Triggered order for {item} at {stand_id}"


tools = [get_optimal_route, place_order]

# Initialize model
try:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        tools=tools,
        system_instruction="You are the SwiftSeat Stadium Concierge. Be concise and friendly. Use the provided tools to handle food requests and order placement."
    )
    # Start a chat session keeping history in memory (naive for single-user dev environments)
    chat_session = model.start_chat()
except Exception as e:
    print("Warning: Failed to initialize Gemini model. (Missing API Key?)", e)
    chat_session = None


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")
    
    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    # If no real API key, return a mock response matching our function calling structure
    if not chat_session:
        return handle_mock_chat(user_message)

    try:
        response = chat_session.send_message(user_message)
        
        # Check if Gemini decided to invoke a tool (Function Calling)
        if hasattr(response, "function_call") and response.function_call:
            fn_call = response.function_call
            function_name = fn_call.name
            args = {key: val for key, val in fn_call.args.items()}
            
            # Send the tool call back to the frontend so the frontend can execute PALO
            return jsonify({
                "type": "function_call",
                "function": function_name,
                "arguments": args,
                "reply": "I'm checking the live wait times and optimal routes for you right now..."
            })
            
        else:
            return jsonify({
                "type": "text",
                "reply": response.text
            })

    except Exception as e:
        print("API Error:", e)
        return jsonify({"error": str(e)}), 500


def handle_mock_chat(msg):
    # Mocking Gemini logic if API key isn't provided
    lower_msg = msg.lower()
    if "hungry" in lower_msg or "burger" in lower_msg or "food" in lower_msg:
        return jsonify({
            "type": "function_call",
            "function": "get_optimal_route",
            "arguments": {"food_category": "food"},
            "reply": "(Mock) Let me calculate the fastest stand for you..."
        })
    elif "order" in lower_msg:
        return jsonify({
            "type": "function_call",
            "function": "place_order",
            "arguments": {"stand_id": "south_kiosk", "item": "burger"},
            "reply": "(Mock) Ordering your item and sending the voucher to Google Wallet!"
        })
    else:
        return jsonify({
            "type": "text",
            "reply": "(Mock) I am your stadium concierge! Ask me for food padding 'burger' to see routing."
        })

if __name__ == '__main__':
    print("Starting Gemini Proxy Server on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
