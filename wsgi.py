# wsgi.py
import sys
import os

# Add the project directory to the Python path
# This allows the WSGI server to find your modules like app.py, config.py, etc.
project_home = os.path.dirname(__file__)
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import the Flask app object from your app.py file
# The 'application' variable is what WSGI servers like mod_wsgi look for by default.
from app import app as application
