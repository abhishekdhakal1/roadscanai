# reset_db.py
from app.database import engine, Base
from app import models  # noqa: F401

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Fresh database — old tables dropped, new ones created.")
