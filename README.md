## Introduction

The project began by using code from https://github.com/toygunozyurekk/Voice-Chatbot. Thank you toygun for the code and his instructions on Medium https://python.plainenglish.io/voice-chatbot-openai-whisper-2ee5cd732239

Ability to track student transcripts, updated audio handling, frontend for instructors to create their own chatbots based on custom prompts, improved UI and other improvements by https://github.com/Hill134Z and https://github.com/annepham1512

This project offers a language teachers the ability to host their own AI chatbot using an OpenAI key. Integrated into a Flask backend with a React frontend, the application allows students to interact via audio or text with an AI bot created by instructor prompts. "Pretend you are a native Spanish speaking helping an English speaker ..." etc. Example prompts are included in AIPrompt.json. Student conversations are transcribed and visible to the instructors.

A more detailed description of the chatbot along with screenshots is available on the Dickinson College Academic Technology blog, though the bot itself is only available on our campus. https://blogs.dickinson.edu/academic-technology/2025/07/28/update-to-foreign-language-chatbot/

## Installation

### Prerequisites

- Linux with Apache
- Python 3.8 or newer
- Node.js and npm
- Flask
- React
- Axios
- dotenv (for environment variable management)
- Flask-CORS (for handling cross-origin requests)
- httpx
- certify

### Dev environment

### Backend Setup

1. Clone the repository to your local machine.
2. You will need a DNS entry on your webserver for the flask backend. The default port for flask is 5000.
3. Navigate to the project directory and install the Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Rename the ExampleEnvFile.env file in the root project directory to just .env file and enter the variables. For example:

    ```env
    OPENAI_API_KEY=your_api_key_here
    ```
5. uncomment the the final line in app.py for app.run to allow it to be run directly via the command line as with the flask dev server.

4. Start the Flask server:

    ```bash
    flask run --host 0.0.0.0 --debug
    ```

### Frontend Setup

1. Navigate to the /my-app frontend project directory
2. You will need a DNS entry on your webserver for the react frontend. The default port for react is 3000.
3. Install the required npm packages:

    ```bash
    npm install
    ```

4. Rename the ExampleReactEnvFile.env file  to just .env file and enter the variables.
5. In my-app/package.json update the variable in the "start" area with your host and port
6. Update the my-app/src/setupProxy.js file by changing the target value to the url of your flask server. This is creating a proxy server so that the paths /api/some_route and are handled and sent to the /some_route on flask.
7. Start the React development server:
    
    ```bash
    npm start
    ```

### Prod Environment
### Backend Setup

1. Install mod_wsgi for apache
2. Add DNS entry for flask the default port is 5000.
3. Need to add a virtual host for flask and react. Check the ExampleHTTPConfFile.txt in this repo for an example
4. Clone the repository to your server.
5. Navigate to the project directory and install the Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

6. Rename the ExampleEnvFile.env file in the root project directory to just .env file and enter the variables. For example:

    ```env
    OPENAI_API_KEY=your_api_key_here
    ```
7. Comment out the the final line in app.py for app.run if it isn't already, since we are not running it command line as with the flask dev server.

8. Create and activate the virtual environment for python, from the root:

    ```bash
    python -m venv venv
    ```
        ```bash
    source venv/bin/activate
    ```
9. Restart apache  

### Frontend Setup

1. Navigate to the /my-app frontend project directory
2. You will need a DNS entry on your webserver for the react frontend. The default port for react is 3000.
3. Install the required npm packages:

    ```bash
    npm install
    ```

4. Rename the ExampleReactEnvFile.env file  to just .env file and enter the variables.
5. In my-app/package.json update the variable in the "start" area with your host and port
6. Create the node_modules and build directories for React:

    ```bash
    npm build
    ```

## Usage

Once both the frontend and backend servers are running, students navigate to the URL provided by the React server in your web browser.

- To send a text message: Type your message in the text box and hit enter.
- To send an audio message: Click the microphone icon to start. Most browsers will ask you want to allow the microphone say yes. Stop the recording the circle button next to the mic. Students my preview their recording. Then either redo the recording or click the Send Audio button.

Instructors will need a password, specified in the .env file, to access the dashboard at /professor=view.  Top right corner menu to add/edit prompts and view transcripts of their students.
