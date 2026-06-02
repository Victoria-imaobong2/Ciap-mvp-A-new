"""initial schema

Revision ID: 20260412_initial_schema
Revises: 
Create Date: 2026-04-12 00:00:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260412_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("language_preference", sa.String(length=16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)

    op.create_table(
        "campaigns",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("sme_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("goal", sa.String(length=100), nullable=True),
        sa.Column("budget", sa.Integer(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["sme_id"], ["users.id"], name=op.f("fk_campaigns_sme_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_campaigns")),
    )

    op.create_table(
        "content_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("creator_id", sa.String(length=36), nullable=False),
        sa.Column("platform", sa.String(length=50), nullable=False),
        sa.Column("external_id", sa.String(length=255), nullable=False),
        sa.Column("media_type", sa.String(length=50), nullable=False),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("permalink", sa.String(length=2048), nullable=True),
        sa.Column("posted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], name=op.f("fk_content_items_creator_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_content_items")),
    )

    op.create_table(
        "creator_profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=True),
        sa.Column("location", sa.String(length=120), nullable=True),
        sa.Column("followers", sa.Integer(), nullable=True),
        sa.Column("top_platform", sa.String(length=50), nullable=True),
        sa.Column("bio", sa.String(length=1000), nullable=True),
        sa.Column("social_links", sa.JSON(), nullable=True),
        sa.Column("influence_score", sa.Float(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_creator_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_creator_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_creator_profiles_user_id")),
    )

    op.create_table(
        "sme_profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=True),
        sa.Column("industry", sa.String(length=120), nullable=True),
        sa.Column("billing_info", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_sme_profiles_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sme_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_sme_profiles_user_id")),
    )

    op.create_table(
        "platform_tokens",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("platform_name", sa.String(length=50), nullable=False),
        sa.Column("access_token", sa.String(length=2048), nullable=False),
        sa.Column("refresh_token", sa.String(length=2048), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("platform_user_id", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_platform_tokens_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_platform_tokens")),
    )

    op.create_table(
        "platform_metrics",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("platform_name", sa.String(length=50), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("metrics", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_platform_metrics_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_platform_metrics")),
    )

    op.create_table(
        "campaign_metrics",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("campaign_id", sa.String(length=36), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("metrics", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["campaign_id"], ["campaigns.id"], name=op.f("fk_campaign_metrics_campaign_id_campaigns")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_campaign_metrics")),
    )

    op.create_table(
        "influence_scores",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("creator_id", sa.String(length=36), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("model_version", sa.String(length=100), nullable=True),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("components", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], name=op.f("fk_influence_scores_creator_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_influence_scores")),
    )

    op.create_table(
        "audience_snapshots",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("creator_id", sa.String(length=36), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("age_distribution", sa.JSON(), nullable=True),
        sa.Column("location_distribution", sa.JSON(), nullable=True),
        sa.Column("interest_tags", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], name=op.f("fk_audience_snapshots_creator_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audience_snapshots")),
    )

    op.create_table(
        "sentiment_results",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("content_id", sa.String(length=36), nullable=False),
        sa.Column("positive_ratio", sa.Float(), nullable=True),
        sa.Column("negative_ratio", sa.Float(), nullable=True),
        sa.Column("neutral_ratio", sa.Float(), nullable=True),
        sa.Column("dominant_sentiment", sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(["content_id"], ["content_items.id"], name=op.f("fk_sentiment_results_content_id_content_items")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sentiment_results")),
    )

    op.create_table(
        "campaign_collaborations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("campaign_id", sa.String(length=36), nullable=False),
        sa.Column("creator_id", sa.String(length=36), nullable=False),
        sa.Column("content_id", sa.String(length=36), nullable=True),
        sa.Column("negotiated_fee", sa.Integer(), nullable=True),
        sa.Column("tracking_link", sa.String(length=2048), nullable=True),
        sa.Column("conversions", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["campaign_id"], ["campaigns.id"], name=op.f("fk_campaign_collaborations_campaign_id_campaigns")),
        sa.ForeignKeyConstraint(["content_id"], ["content_items.id"], name=op.f("fk_campaign_collaborations_content_id_content_items")),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], name=op.f("fk_campaign_collaborations_creator_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_campaign_collaborations")),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_audit_logs_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_logs")),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("campaign_collaborations")
    op.drop_table("sentiment_results")
    op.drop_table("audience_snapshots")
    op.drop_table("influence_scores")
    op.drop_table("campaign_metrics")
    op.drop_table("platform_metrics")
    op.drop_table("platform_tokens")
    op.drop_table("sme_profiles")
    op.drop_table("creator_profiles")
    op.drop_table("content_items")
    op.drop_table("campaigns")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")