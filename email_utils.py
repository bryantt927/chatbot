import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from config import Config
from flask import jsonify

def send_transcript(user_token, professor_email, student_email, professor_name, extra_note, student_name, chatbot_name, current_datetime):
    history_file = os.path.join(Config.CHAT_HISTORY_DIR, f'chat_history{user_token}.txt')
    if not os.path.exists(history_file):
        return jsonify({"error": "Chat history not found!"}), 404

    with open(history_file, 'r', encoding='utf-8') as f:
        transcript = f.read()

    default_message = (
        f"Hi {{name}},\n\n"
        f"Here is {student_name}'s transcript for chatbot {chatbot_name} on {current_datetime}.\n\n"
        f"Thanks\n\n"
    )

    full_body_professor = default_message.format(name=professor_name or '')
    full_body_student = default_message.format(name=student_name)

    if extra_note:
        full_body_professor += f"Additional Note from Student:\n{extra_note}\n\n"
        full_body_student += f"Additional Note from Student:\n{extra_note}\n\n"

    full_body_professor += f"--- Conversation Transcript Below ---\n\n{transcript}"
    full_body_student += f"--- Conversation Transcript Below ---\n\n{transcript}"

    try:
        # Create attachment once
        with open(history_file, 'rb') as attachment:
            file_part = MIMEBase('application', 'octet-stream')
            file_part.set_payload(attachment.read())
            encoders.encode_base64(file_part)
            attachment_filename = os.path.basename(history_file)
            file_part.add_header("Content-Disposition", f"attachment; filename={attachment_filename}")

        def send_email(to_email, body, recipient_name=""):
            msg = MIMEMultipart()
            msg['From'] = Config.SMTP_USERNAME
            msg['To'] = to_email
            msg['Subject'] = f"Language Chatbot Conversation Transcript - {student_name}"
            msg.attach(MIMEText(body, 'plain'))
            msg.attach(file_part)

            with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
                server.starttls()
                if Config.SMTP_USERNAME and Config.SMTP_PASSWORD:
                    server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
                server.sendmail(Config.SMTP_USERNAME, to_email, msg.as_string())

        # Send to professor
        if professor_email:
            send_email(professor_email, full_body_professor, professor_name)

        # Send to student
        if student_email and student_email.strip() and student_email.lower() != professor_email.lower():
            send_email(student_email, full_body_student, student_name)

        return jsonify({"message": "Transcript sent successfully to both parties."}), 200

    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {str(e)}")
        return jsonify({"error": "Failed to authenticate with SMTP server. Check username/password."}), 500
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({"error": f"Failed to send transcript: {str(e)}"}), 500