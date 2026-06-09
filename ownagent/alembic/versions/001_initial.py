"""Initial schema creation

Revision ID: 001
Revises: 
Create Date: 2026-01-31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False, server_default='New Conversation'),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('model', sa.String(100), nullable=False),
        sa.Column('system_prompt', sa.Text(), nullable=True),
        sa.Column('message_count', sa.Integer(), server_default='0'),
        sa.Column('is_pinned', sa.Boolean(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create files table
    op.create_table(
        'files',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('original_name', sa.String(255), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('size', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(20), server_default='uploading'),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('storage_path', sa.String(500), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create conversation_files junction table
    op.create_table(
        'conversation_files',
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('conversations.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('file_id', sa.String(36), sa.ForeignKey('files.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('attached_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create message_attachments junction table
    op.create_table(
        'message_attachments',
        sa.Column('message_id', sa.String(36), sa.ForeignKey('messages.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('file_id', sa.String(36), sa.ForeignKey('files.id', ondelete='CASCADE'), primary_key=True)
    )
    
    # Create user_settings table
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('key', sa.String(100), unique=True, nullable=False),
        sa.Column('value', sa.JSON(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create provider_configs table
    op.create_table(
        'provider_configs',
        sa.Column('provider_id', sa.String(50), primary_key=True),
        sa.Column('api_key_encrypted', sa.Text(), nullable=True),
        sa.Column('base_url', sa.String(500), nullable=True),
        sa.Column('is_enabled', sa.Boolean(), server_default='1'),
        sa.Column('model_preferences', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create memory_facts table
    op.create_table(
        'memory_facts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('conversation_id', sa.String(36), sa.ForeignKey('conversations.id', ondelete='SET NULL'), nullable=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('confidence', sa.Float(), server_default='1.0'),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create search_cache table
    op.create_table(
        'search_cache',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('query_hash', sa.String(64), unique=True, nullable=False),
        sa.Column('query_text', sa.Text(), nullable=False),
        sa.Column('results', sa.JSON(), nullable=False),
        sa.Column('result_count', sa.Integer(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.current_timestamp())
    )
    
    # Create indexes
    op.create_index('idx_conversations_updated', 'conversations', ['updated_at'])
    op.create_index('idx_conversations_pinned', 'conversations', ['is_pinned', 'updated_at'])
    op.create_index('idx_messages_conversation', 'messages', ['conversation_id', 'created_at'])
    op.create_index('idx_messages_created', 'messages', ['created_at'])
    op.create_index('idx_files_status', 'files', ['status'])
    op.create_index('idx_files_created', 'files', ['created_at'])
    op.create_index('idx_settings_key', 'user_settings', ['key'])
    op.create_index('idx_memory_category', 'memory_facts', ['category', 'is_active'])
    op.create_index('idx_memory_confidence', 'memory_facts', ['confidence'])
    op.create_index('idx_search_hash', 'search_cache', ['query_hash'])
    op.create_index('idx_search_expires', 'search_cache', ['expires_at'])


def downgrade() -> None:
    op.drop_index('idx_search_expires', 'search_cache')
    op.drop_index('idx_search_hash', 'search_cache')
    op.drop_index('idx_memory_confidence', 'memory_facts')
    op.drop_index('idx_memory_category', 'memory_facts')
    op.drop_index('idx_settings_key', 'user_settings')
    op.drop_index('idx_files_created', 'files')
    op.drop_index('idx_files_status', 'files')
    op.drop_index('idx_messages_created', 'messages')
    op.drop_index('idx_messages_conversation', 'messages')
    op.drop_index('idx_conversations_pinned', 'conversations')
    op.drop_index('idx_conversations_updated', 'conversations')
    
    op.drop_table('search_cache')
    op.drop_table('memory_facts')
    op.drop_table('provider_configs')
    op.drop_table('user_settings')
    op.drop_table('message_attachments')
    op.drop_table('conversation_files')
    op.drop_table('files')
    op.drop_table('messages')
    op.drop_table('conversations')
