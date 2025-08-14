import os
import time
import json
from openai import OpenAI
from config import Config
import sys

client = OpenAI(api_key=Config.OPENAI_API_KEY)

def get_conversation_pairs(chat_history, max_lines=None):
    """
    Extract the most recent conversation lines from chat history.
    Uses CUTOFF_LINE_INDEX from config to determine how many lines to include.
    """
    if max_lines is None:
        max_lines = Config.CUTOFF_LINE_INDEX

    lines = chat_history.splitlines()

    # Filter out empty lines and extract message lines
    message_lines = []
    for line in lines:
        line = line.strip()
        if line and (' User: ' in line or ' Assistant: ' in line):
            message_lines.append(line)

    # Return the most recent max_lines (sliding window)
    recent_lines = message_lines[-max_lines:] if len(message_lines) > max_lines else message_lines

    # Convert to format for sending to AI
    context_lines = []
    for line in recent_lines:
        # Extract just the message content, not the timestamp
        if ' User: ' in line:
            user_msg = line.split(' User: ', 1)[1]
            context_lines.append(f"User: {user_msg}")
        elif ' Assistant: ' in line:
            assistant_msg = line.split(' Assistant: ', 1)[1]
            context_lines.append(f"Assistant: {assistant_msg}")

    return "\n".join(context_lines)


def chatcompletion(
    user_input, user_name, user_prompt, user_token, language, chat_history
):
    """
    Generate chat completion with conversation context.
    Uses CUTOFF_LINE_INDEX from config to limit history.
    Optimized for gpt-4.1 and gpt-4.1-mini.
    """

    # Get limited history using config value
    limited_history = get_conversation_pairs(chat_history)

    # --- Load COMPLEX_MODEL_LANGUAGES ---
    complex_model_languages_json = os.getenv("COMPLEX_MODEL_LANGUAGES")
    COMPLEX_MODEL_LANGUAGES = []
    if complex_model_languages_json:
        try:
            COMPLEX_MODEL_LANGUAGES = json.loads(complex_model_languages_json)
        except json.JSONDecodeError as e:
            print(f"Error decoding COMPLEX_MODEL_LANGUAGES from .env: {e}")

    # --- Load ADVANCED_MODEL and BASE_MODEL ---
    ADVANCED_MODEL = os.getenv("ADVANCED_MODEL", "gpt-4.1")
    BASE_MODEL = os.getenv("BASE_MODEL", "gpt-4.1-mini")

    # Determine model_name based on language
    if language in COMPLEX_MODEL_LANGUAGES:
        model_name = ADVANCED_MODEL
    else:
        model_name = BASE_MODEL

    print(f"Language is {language}, using model: {model_name}")

    # Count lines for logging
    history_lines = limited_history.splitlines() if limited_history else []
    print(f"Context: {len(history_lines)} lines (max: {Config.CUTOFF_LINE_INDEX})")

    # Build the system prompt with conversation history
    system_prompt = (
        "Respond concisely, using no more than 2–3 sentences unless clarification is requested.\n\n"
        + user_prompt
    )
    if limited_history:
        system_prompt += f"\n\nPrevious conversation history:\n{limited_history}"

    # --- Responses API call ---
    output = client.responses.create(
        model=model_name,
        max_output_tokens=2000,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input},
        ],
    )

    # Get the text output
    return output.output_text



def chat(user_input, user_name, user_prompt, user_token, language):
    """
    Main chat function that handles conversation flow and history management.
    Uses unified file format: DD/MM HH:MM:SS User: message / DD/MM HH:MM:SS Assistant: response
    """
    history_file = os.path.join(Config.CHAT_HISTORY_DIR, f'chat_history{user_token}.txt')
    print(f"Using token: {user_token}")  
    print(f"History file: {history_file}")  

    # Read existing chat history
    try:
        with open(history_file, 'r', encoding='utf-8') as f:
            chat_history = f.read()
    except FileNotFoundError:
        chat_history = ""

    # Generate response with context
    response = chatcompletion(user_input, user_name, user_prompt, user_token, language, chat_history)

    # Save the new conversation to file in unified format
    current_day = time.strftime("%d/%m", time.localtime())
    current_time = time.strftime("%H:%M:%S", time.localtime())

    try:
        # Append new conversation pair to file
        with open(history_file, "a", encoding="utf-8") as f:
            if chat_history:
                f.write(f"\n{current_day} {current_time} User: {user_input}")
                f.write(f"\n{current_day} {current_time} Assistant: {response}")
            else:
                f.write(f"{current_day} {current_time} User: {user_input}")
                f.write(f"\n{current_day} {current_time} Assistant: {response}")

        print(f"Successfully wrote to {history_file}", file=sys.stderr)

    except (IOError, PermissionError) as e:
        # This message will appear in your web server's error logs
        print(
            f"!!! CRITICAL: FAILED TO WRITE CHAT HISTORY FILE. CHECK PERMISSIONS !!!",
            file=sys.stderr,
        )
        print(f"Error for file '{history_file}': {e}", file=sys.stderr)

    return response


def get_response(userText, user_name, user_prompt, user_token, language):
    """
    Public interface for getting chat responses.
    """
    return chat(userText, user_name, user_prompt, user_token, language)
