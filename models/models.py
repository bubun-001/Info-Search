from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint
from pgvector.sqlalchemy import Vector

db = SQLAlchemy()

class Grade(db.Model):
    __tablename__ = 'grade_master'
    grade_id = db.Column(db.Integer, primary_key=True)
    grade_name = db.Column(db.String(255), unique=True,nullable=False)

class Language(db.Model):
    __tablename__ = 'lang_master'
    lang_id = db.Column(db.Integer, primary_key=True)
    lang_name = db.Column(db.String(255),unique=True, nullable=False)

class BookType(db.Model):
    __tablename__ = 'book_type_master'
    book_type_id = db.Column(db.Integer, primary_key=True)
    book_type_name = db.Column(db.String(255),unique=True, nullable=False)

class Book(db.Model):
    __tablename__ = 'book_master'
    book_id = db.Column(db.Integer, primary_key=True)
    grade_id = db.Column(db.Integer, db.ForeignKey('grade_master.grade_id'), nullable=False)
    book_type_id = db.Column(db.Integer, db.ForeignKey('book_type_master.book_type_id'), nullable=False)
    book_name = db.Column(db.String(255),unique=True, nullable=False)
    book_url = db.Column(db.Text, nullable=True)
    lang_id = db.Column(db.Integer, db.ForeignKey('lang_master.lang_id'), nullable=False)

class Topic(db.Model):
    __tablename__ = 'topic_master'
    topic_id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book_master.book_id'), nullable=False)
    topic_name = db.Column(db.String(255),unique=True, nullable=False)
    topic_url_pdf = db.Column(db.Text)
    topic_url_doc = db.Column(db.Text)

class SubTopic(db.Model):
    __tablename__ = 'sub_topic_master'
    sub_topic_id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic_master.topic_id'), nullable=False)
    sub_topic_name = db.Column(db.String(255), nullable=True)
    sub_topic_url_pdf = db.Column(db.Text)
    sub_topic_url_doc = db.Column(db.Text)

     # Composite unique constraint on topic_id and sub_topic_name
    __table_args__ = (UniqueConstraint('topic_id', 'sub_topic_name', name='_topic_id_sub_topic_name_uc'),)

class User(db.Model):
    __tablename__ = 'user_master'
    user_id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255), unique=True, nullable=False)  # Changed column name
    user_password = db.Column(db.String(255), nullable=False)
    # Consider storing hashed passwords only


class EmbeddingType(db.Model):
    __tablename__ = 'embedding_master'
    embed_type_id = db.Column(db.Integer, primary_key=True)
    embed_type = db.Column(db.String(255), nullable=False)

class EmbeddingDetail(db.Model):
    __tablename__ = 'embedding_detail'
    embedding_id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book_master.book_id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic_master.topic_id'), nullable=False)
    sub_topic_id = db.Column(db.Integer, db.ForeignKey('sub_topic_master.sub_topic_id'), nullable=True)
    embed_id = db.Column(db.Integer, db.ForeignKey('embedding_master.embed_type_id'), nullable=False)
    embed_text = db.Column(db.Text, nullable=False)
    reviewed = db.Column(db.Boolean, default=False, nullable=False)  # Whether the chunk has been reviewed
    embed_vector = db.Column(Vector(), nullable=True)
    # You'll need to replace Vector with an actual VECTOR type if using pgvector

class Scraper(db.Model):
    __tablename__ = 'scrapper'
    scrapper_id = db.Column(db.Integer, primary_key=True)
    scrapper_function_path = db.Column(db.Text, nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book_master.book_id'), nullable=False)

     # Composite unique constraint on topic_id and sub_topic_name
    __table_args__ = (UniqueConstraint('book_id', 'scrapper_function_path', name='_book_id_scrapper_function_path_uc'),)


