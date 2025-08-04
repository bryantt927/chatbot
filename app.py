from openai import OpenAI, OpenAIError
from flask import Flask, request, jsonify, make_response, send_file, session
import os
from flask_cors import CORS
import ssl
import secrets
import time
import random
from chat_utils import get_response
from email_utils import send_transcript # Import send_transcript from email_utils
from config import Config
import glob
from datetime import datetime, timedelta
import json
import sys
import re # Added for email validation
import pwd # For getting username from UID
import grp # For getting group name from GID

# Define the absolute path to the project's root directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Validate configuration on startup
Config.validate_required_configs()


client = OpenAI(api_key=Config.OPENAI_API_KEY)

app = Flask(__name__)
CORS(app, origins="*")
app.secret_key = Config.SECRET_KEY
app.config['SESSION_COOKIE_SECURE'] = True 

# Use the BASE_DIR to define the path to files written to by the app
PROMPT_FILE = os.path.join(BASE_DIR, 'AIPrompt.json')
SAVE_DIRECTORY = os.path.join(BASE_DIR, "audio_files")
DATA_FILE = os.path.join(BASE_DIR, "submissions.json")


# Create necessary directories
for directory in [SAVE_DIRECTORY, Config.CHAT_HISTORY_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# SSL context setup
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(Config.CERT_FILE, Config.KEY_FILE, password=Config.SSL_KEY_PASSWORD)

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)



def generate_user_token():
    """Generate a unique user token"""
    return str(secrets.token_hex(16))

def get_conversation_context(user_token, limit=25):
    """Get conversation history from the unified chat history file format for display purposes"""
    conversation_file = os.path.join(Config.CHAT_HISTORY_DIR, f"chat_history{user_token}.txt")
    
    if not os.path.exists(conversation_file):
        return []
    
    try:
        with open(conversation_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Parse conversations from the unified format
        conversations = []
        i = 0
        while i < len(lines) - 1:
            user_line = lines[i].strip()
            if i + 1 < len(lines):
                assistant_line = lines[i + 1].strip()
                
                # Extract user message (format: DD/MM HH:MM:SS User: message)
                if ' User: ' in user_line and ' Assistant: ' in assistant_line:
                    user_msg = user_line.split(' User: ', 1)[1] if ' User: ' in user_line else user_line
                    assistant_msg = assistant_line.split(' Assistant: ', 1)[1] if ' Assistant: ' in assistant_line else assistant_line
                    
                    conversations.append({
                        "user": user_msg,
                        "assistant": assistant_msg
                    })
                    i += 2  # Skip both lines since we processed a pair
                else:
                    i += 1
            else:
                i += 1
        
        # Return the last N conversations
        return conversations[-limit:] if conversations else []
        
    except Exception as e:
        print(f"Error reading conversation file: {e}")
        return []

def generate_tts_audio(text, voice="alloy"):
    """Generate TTS audio using OpenAI's TTS API."""
    try:
        timestamp = int(time.time())
        random_num = random.randint(1000, 9999)
        audio_filename = f"tts_{timestamp}_{random_num}.mp3"
        audio_filepath = os.path.join(SAVE_DIRECTORY, audio_filename)
        
        
        with client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice=voice,
            input=text
        ) as response:
            response.stream_to_file(audio_filepath)
        
        if os.path.exists(audio_filepath):
            return audio_filename
        return None
    except Exception as e:
        print(f"ERROR TTS: {str(e)}")
        return None

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """Convert text to speech using OpenAI's TTS API."""
    try:
        data = request.get_json()
        text = data.get('text', '')
        voice = data.get('voice', 'alloy')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        audio_filename = generate_tts_audio(text, voice)
        if audio_filename:
            return jsonify({
                'success': True,
                'audio_filename': audio_filename,
                'message': 'TTS audio generated successfully'
            })
        return jsonify({'error': 'Failed to generate TTS audio'}), 500
    except Exception as e:
        print(f"ERROR TTS Route: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/audio/<filename>')
def serve_audio(filename):
    """Serve audio file."""
    try:
        filepath = os.path.join(SAVE_DIRECTORY, filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=False, mimetype="audio/mpeg")
        return jsonify({'error': 'Audio file not found'}), 404
    except Exception as e:
        print(f"ERROR AUDIO: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/start_conversation', methods=['POST'])
def start_conversation():
    """Start a new conversation and return a unique token"""
    try:
        user_token = generate_user_token()
        session['user_token'] = user_token
        return jsonify({
            'user_token': user_token,
            'message': 'New conversation started'
        })
    except Exception as e:
        print(f"Error starting conversation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_response', methods=['POST'])
def get_openai_response():
    """Get text response from OpenAI with conversation history."""
    try:
        data = request.get_json()
        message = data.get('message', '')
        selectedChatbot = data.get('selectedChatbot', '')
        user_token = data.get('user_token')
        if not user_token: # If token not provided, generate a new one
            user_token = generate_user_token()
            session['user_token'] = user_token
        user_name = data.get('user_name', 'Student')
        language = data.get('language', 'English')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400

        prompt_file = load_prompts()
        if selectedChatbot not in prompt_file:
            return jsonify({'error': f"Chatbot '{selectedChatbot}' not found."}), 404

        # Get the original prompt - chat_utils will handle adding history context
        original_prompt = prompt_file[selectedChatbot]['prompt']

        # Get response - chat_utils handles conversation history automatically
        response = get_response(
            userText=message,
            user_name=user_name,
            user_prompt=original_prompt,
            user_token=user_token,
            language=language
        )
        print(f'Using language {language} to get openAI response')

        # Get conversation context for display purposes only
        conversation_context = get_conversation_context(user_token, limit=25)

        return jsonify({
            'response': response, 
            'user_token': user_token,
            'conversation_length': len(conversation_context)
        })
    except Exception as e:
        print(f"Error in get_response: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/whisper', methods=['POST'])
def handle_voice_and_get_response():
    """Process audio input and get response with conversation history."""
    results = []
    user_token = request.form.get('user_token')
    user_name = request.form.get('user_name', 'Student')
    selectedChatbot = request.form.get('selectedChatbot', '')
    language = request.form.get('language', 'English')
    language_code = request.form.get('language_code') or 'en'

    # Generate token if not provided
    if not user_token:
        user_token = generate_user_token()
        session['user_token'] = user_token

    if not selectedChatbot:
        return jsonify({'error': 'No chatbot selected.'}), 400

    prompt_file = load_prompts()
    if selectedChatbot not in prompt_file:
        return jsonify({'error': f"Chatbot '{selectedChatbot}' not found."}), 404

    for filename, handle in request.files.items():
        file_name_random = f"{time.time()}_{random.randint(1,1000)}.mp3"
        file_path = os.path.join(SAVE_DIRECTORY, file_name_random)
        try:
            handle.save(file_path)
            with open(file_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language_code
                )
                transcript = transcription.text
                print(f"Using language {language_code} for whisper")


                # Get the original prompt - chat_utils will handle adding history context
                original_prompt = prompt_file[selectedChatbot]['prompt']

                # Get response - chat_utils handles conversation history automatically
                response = get_response(
                    userText=transcript,
                    user_name=user_name,
                    user_prompt=original_prompt,
                    user_token=user_token,
                    language=language
                )
                print(f"Using language {language} for whisper")

                # Get conversation context for display purposes only
                conversation_context = get_conversation_context(user_token, limit=25)

                results.append({
                    'filename': file_name_random,
                    'transcript': transcript,
                    'openai_response': {'response': response},
                    'user_token': user_token,
                    'conversation_length': len(conversation_context)
                })
        except Exception as e:
            print(f"Error in whisper: {str(e)}")
            return jsonify({'error': str(e)}), 500

    return jsonify(results)

@app.route('/get_conversation', methods=['GET'])
def get_conversation():
    """Retrieve conversation history for a user_token."""
    try:
        user_token = request.args.get('user_token')
        if not user_token:
            return jsonify({'error': 'User token is required'}), 400
        
        # Get conversation from file using the unified format
        conversations = get_conversation_context(user_token, limit=50)  # Get more for display
        return jsonify({'conversations': conversations, 'total': len(conversations)})
    except Exception as e:
        print(f"Error in get_conversation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/clear_conversation', methods=['POST'])
def clear_conversation():
    """Clear conversation history for a user token"""
    try:
        data = request.get_json()
        user_token = data.get('user_token')
        
        if not user_token:
            return jsonify({'error': 'User token is required'}), 400
        
        # Use the same file path as chat_utils
        conversation_file = os.path.join(Config.CHAT_HISTORY_DIR, f"chat_history{user_token}.txt")
        if os.path.exists(conversation_file):
            os.remove(conversation_file)
        
        return jsonify({'message': 'Conversation history cleared'})
    except Exception as e:
        print(f"Error clearing conversation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/send_transcript', methods=['POST'])
def send_transcript_to_professor():
    """Send conversation transcript to professor."""

    try:
        euid = os.geteuid()
        egid = os.getegid()
        username = pwd.getpwuid(euid).pw_name
        groupname = grp.getgrgid(egid).gr_name
        print(f"Current process running as user: {username} (UID: {euid}), group: {groupname} (GID: {egid})")#Todd
        data = request.get_json()
        user_token = data.get('user_token')
        professor_email = data.get('professor_email')
        professor_name = data.get('professor_name', '')
        extra_note = data.get('extra_note', '')
        student_email = data.get('student_email')
        student_name = data.get('student_name', 'Student')
        chatbot_name = data.get('chatbot_name', 'General Chatbot')
        current_datetime = datetime.now().strftime("%d/%m/%Y %H:%M:%S")


        if not user_token or not professor_email:
            return jsonify({'error': 'User token and professor email are required'}), 400

        # Save submission
        submissions = load_submissions()
        prof_key = professor_email.lower()
        student_key = student_email.lower()  

        if prof_key not in submissions:
            submissions[prof_key] = {"students": {}}

        if student_key not in submissions[prof_key]["students"]:
            submissions[prof_key]["students"][student_key] = []


        conversation_context = get_conversation_context(user_token, limit=100)

        # Save the full conversation in submission.json
        submissions[prof_key]["students"][student_key].append({
            "name": student_name,
            "email": student_key,  
            "chatbot_name": chatbot_name,
            "timestamp": current_datetime,
            "user_token": user_token,
            "conversation": conversation_context
        })

        save_submissions(submissions)

        response, status_code = send_transcript(
            user_token=user_token,
            professor_email=professor_email,
            professor_name=professor_name,
            extra_note=extra_note,
            student_email=student_email,
            student_name=student_name,
            chatbot_name=chatbot_name,
            current_datetime=current_datetime
        )

        return response, status_code

    except Exception as e:
        print(f"Error in send_transcript route: {str(e)}")
        return jsonify({'error': str(e)}), 500

def load_prompts():
    """Load chatbot configurations from the prompts.json file."""
    try:
        with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Return an empty dictionary if the file doesn't exist or is empty/corrupt
        return {}

@app.route('/update_prompt', methods=['POST'])
def update_prompt():
    """Update an existing prompt in the prompts.json file."""
    try:
        data = request.get_json()
        title_to_update = data.get('title')
        if not title_to_update:
            return jsonify({'error': 'Title is required'}), 400

        prompts = load_prompts()
        if title_to_update not in prompts:
            return jsonify({'error': 'Prompt not found'}), 404

        # Update the entry with the new data from the form
        prompts[title_to_update] = {
            "name": data.get("name"),
            "language": data.get("language"),
            "level": data.get("level"),
            "initialText": data.get("initialText"),
            "prompt": data.get("prompt") # Multi-line prompts are handled automatically
        }

        # Write the entire updated dictionary back to the file
        with open(PROMPT_FILE, 'w', encoding='utf-8') as f:
            json.dump(prompts, f, ensure_ascii=False, indent=2)

        return jsonify({'message': 'Prompt updated successfully.'})
    except Exception as e:
        print(f"Error in update_prompt: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/save_prompt', methods=['POST'])
def save_prompt():
    """Save a new prompt to the prompts.json file."""
    try:
        data = request.get_json()
        title = data.get('title')
        if not title:
            return jsonify({'error': 'Title is required'}), 400

        prompts = load_prompts()
        if title in prompts:
            return jsonify({'error': 'A prompt with this title already exists.'}), 409

        # Add a new entry to the dictionary
        prompts[title] = {
            "name": data.get("name"),
            "language": data.get("language"),
            "level": data.get("level"),
            "initialText": data.get("initialText"),
            "prompt": data.get("prompt") # Multi-line prompts are handled automatically
        }

        # Write the entire updated dictionary back to the file
        with open(PROMPT_FILE, 'w', encoding='utf-8') as f:
            json.dump(prompts, f, ensure_ascii=False, indent=2)

        return jsonify({'message': 'Prompt saved successfully.'})
    except Exception as e:
        print(f"Error in save_prompt: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/delete_prompt', methods=['POST'])
def delete_prompt():
    try:
        data = request.json
        prompt_name_to_delete = data.get('prompt_name')

        if not prompt_name_to_delete:
            print("DELETE PROMPT FUNCTION: Error - Prompt name not provided.")
            return jsonify({'success': False, 'message': 'Prompt name not provided'}), 400

        
        prompts = {}

        if os.path.exists(PROMPT_FILE):
            with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
                prompts = json.load(f)
        else:
            print(f"DELETE PROMPT FUNCTION: File not found at path: {PROMPT_FILE}")

        if prompt_name_to_delete in prompts:
            del prompts[prompt_name_to_delete]
            with open(PROMPT_FILE, 'w', encoding='utf-8') as f:
                json.dump(prompts, f, indent=4, ensure_ascii=False)
            return jsonify({'success': True, 'message': f'Prompt "{prompt_name_to_delete}" deleted successfully'})
        else:
            return jsonify({'success': False, 'message': f'Prompt "{prompt_name_to_delete}" not found'}), 404

    except Exception as e:
        # app.logger.error is a good practice, but print is better for direct console output in this case.
        print(f"DELETE PROMPT FUNCTION: ERROR - An exception occurred: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500  

@app.route('/data', methods=['GET'])
def get_data():
    """Send chatbot configurations to frontend."""
    try:
        data = load_prompts()
        return jsonify(data)
    except Exception as e:
        print(f"Error in get_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

def cleanup_old_files(directory, days=180):
    """Delete files older than specified days in the given directory."""
    if not os.path.exists(directory):
        return
    cutoff = datetime.now() - timedelta(days=days)
    for file in glob.glob(os.path.join(directory, '*')):
        try:
            if os.path.getmtime(file) < cutoff.timestamp():
                os.remove(file)
        except OSError:
            pass  # File might be in use or already deleted

def load_submissions():
    if not os.path.exists(Config.SUBMISSION_FILE):
        return {}
    
    # Use a try-except block to handle an empty file, which is also a valid JSONDecodeError
    try:
        with open(Config.SUBMISSION_FILE, 'r', encoding='utf-8') as f:
            # Load the file into a variable and return that variable
            submissions = json.load(f)
            return submissions
    except json.JSONDecodeError:
        # This can happen if the file is empty or corrupted.
        # Returning an empty dict is the correct action.
        return {}

def save_submissions(data):
    with open(Config.SUBMISSION_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/professor/students', methods=['GET'])
def get_students_for_professor():
    professor_email = request.args.get('email')
    if not professor_email:
        return jsonify({'error': 'Professor email is required'}), 400
    submissions = load_submissions()
    prof_key = professor_email.lower()
    if prof_key not in submissions:
        return jsonify({'students': []})

    student_list = [
        {
            "name": info[0]['name'],
            "email": info[0]['email'],
            "key": key,
            "chatbots": {
                item['chatbot_name']: {"last_used": item['timestamp']}
                for item in sorted(info, key=lambda x: x['timestamp'], reverse=True)
            }
        } for key, info in submissions[prof_key]["students"].items()
    ]
        
    response_data = {'students': student_list}

    return jsonify({'students': student_list})

@app.route('/professor/conversation', methods=['GET'])
def get_student_conversation():
    professor_email = request.args.get('prof_email')
    student_key = request.args.get('student_key')
    chatbot_name = request.args.get('chatbot_name')

    if not professor_email or not student_key or not chatbot_name:
        return jsonify({'error': 'Missing parameters'}), 400

    submissions = load_submissions()
    prof_key = professor_email.lower()

    if prof_key not in submissions:
        return jsonify({'error': 'No records found'}), 404

    student_data = submissions[prof_key]["students"].get(student_key)
    if not student_data:
        return jsonify({'error': 'Student not found'}), 404

    for record in reversed(student_data):
        if record['chatbot_name'] == chatbot_name:
            user_token = record['user_token']
            conversation = get_conversation_context(user_token, limit=100)
            return jsonify({
                'conversation': conversation,
                'chatbot_name': chatbot_name,
                'student_name': record['name'],
                'timestamp': record['timestamp']
            })
    return jsonify({'error': 'Chatbot not found for this student'}), 404

# This block will only run when you execute `python app.py` directly
# It will NOT run when the application is loaded by a WSGI server like Apache/mod_wsgi
if __name__ == '__main__':
    # Can keep cleanup tasks here if you want to run them manually. Won't run with WSGI
    cleanup_old_files(SAVE_DIRECTORY)
    cleanup_old_files(Config.CHAT_HISTORY_DIR)
    
    # The app.run() part is for development only and should not be used in production
    print("This script is not intended to be run directly in production.")
    print(f"For development, run with a WSGI server like gunicorn, or use 'flask run'.")
    # For development with SSL, you might run it like this:
    # app.run(ssl_context=context, host=Config.HOST, port=Config.PORT, debug=False)
