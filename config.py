import os
from dotenv import load_dotenv

# Load environment variables at the module level
# Ensure this path is correct for your .env file
# If your .env file is in .gitignore/, change this to:
# load_dotenv(dotenv_path=".gitignore/.env")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the .env file using the absolute path
dotenv_path = os.path.join(BASE_DIR, '.env')
load_dotenv(dotenv_path=dotenv_path)

#load_dotenv()

class Config:
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 8034))
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    CERT_FILE = os.environ.get('CERT_FILE')
    KEY_FILE = os.environ.get('KEY_FILE')
    SSL_KEY_PASSWORD = os.environ.get('SSL_KEY_PASSWORD', '')
    CHAT_HISTORY_DIR = os.path.join(BASE_DIR, 'conversation_history')

    # SMTP Configuration
    SMTP_SERVER = os.environ.get('SMTP_SERVER')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD') # It's still read, but no longer strictly required by validation

    # Cutoff line index for chat history
    CUTOFF_LINE_INDEX = int(os.getenv('CUTOFF_LINE_INDEX', 30))

    # Flask Debug mode
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    CWD = os.getcwd()
    SUBMISSION_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "submissions.json")

    @classmethod
    def validate_required_configs(cls):
        """Validate that required configurations are present"""
        required_configs = [
            ('OPENAI_API_KEY', cls.OPENAI_API_KEY),
            ('SECRET_KEY', cls.SECRET_KEY),
            ('CERT_FILE', cls.CERT_FILE),
            ('KEY_FILE', cls.KEY_FILE),
            ('SMTP_SERVER', cls.SMTP_SERVER),
            ('SMTP_PORT', cls.SMTP_PORT),
            ('SMTP_USERNAME', cls.SMTP_USERNAME),
            # SMTP_PASSWORD is removed from this list, so it's not validated as strictly required
        ]
        
        missing_configs = []
        for config_name, config_value in required_configs:
            if isinstance(config_value, int):
                if config_name == 'SMTP_PORT' and config_value == 0:
                    missing_configs.append(config_name)
            elif not config_value:
                missing_configs.append(config_name)
        
        if missing_configs:
            raise ValueError(f"Missing or invalid required environment variables: {', '.join(missing_configs)}")
        
        return True
