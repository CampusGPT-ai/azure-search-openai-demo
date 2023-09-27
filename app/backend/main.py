import os
from app import create_app

app = create_app()
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)
