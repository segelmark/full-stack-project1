import os
SECRET_KEY = os.urandom(32)
# Grabs the folder where the script runs.
basedir = os.path.abspath(os.path.dirname(__file__))

# Enable debug mode.
DEBUG = True

# Connect to the database


# DATABASE URL
SQLALCHEMY_DATABASE_URI = 'postgres://lukas@localhost:5432/fyyur'

#Remove annoying error message
SQLALCHEMY_TRACK_MODIFICATIONS = False
