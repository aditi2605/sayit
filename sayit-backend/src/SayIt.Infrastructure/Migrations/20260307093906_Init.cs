using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814

namespace SayIt.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "channels",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    slug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    emoji = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    thread_count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_channels", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    anonymous_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    avatar_index = table.Column<short>(type: "smallint", nullable: false),
                    auth_provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_banned = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "threads",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false),
                    reply_count = table.Column<int>(type: "integer", nullable: false),
                    reaction_count = table.Column<string>(type: "jsonb", nullable: false),
                    auto_delete_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_threads", x => x.id);
                    table.ForeignKey(
                        name: "FK_threads_channels_channel_id",
                        column: x => x.channel_id,
                        principalTable: "channels",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_threads_users_author_id",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "reactions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    target_id = table.Column<Guid>(type: "uuid", nullable: false),
                    emoji = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ThreadId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reactions", x => x.id);
                    table.ForeignKey(
                        name: "FK_reactions_threads_ThreadId",
                        column: x => x.ThreadId,
                        principalTable: "threads",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_reactions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "replies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    thread_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_reply_id = table.Column<Guid>(type: "uuid", nullable: true),
                    body = table.Column<string>(type: "text", nullable: false),
                    reaction_count = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_replies", x => x.id);
                    table.ForeignKey(
                        name: "FK_replies_replies_parent_reply_id",
                        column: x => x.parent_reply_id,
                        principalTable: "replies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_replies_threads_thread_id",
                        column: x => x.thread_id,
                        principalTable: "threads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_replies_users_author_id",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "channels",
                columns: new[] { "id", "emoji", "name", "slug", "thread_count" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000001"), "🔥", "Hot Takes", "hot-takes", 0 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000002"), "🫣", "Confessions", "confessions", 0 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000003"), "💢", "Rants", "rants", 0 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000004"), "🧠", "Advice", "advice", 0 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000005"), "✨", "Dreams", "dreams", 0 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000006"), "🍵", "Spill the Tea", "spill-the-tea", 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_channels_slug",
                table: "channels",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_reactions_target",
                table: "reactions",
                columns: new[] { "target_type", "target_id" });

            migrationBuilder.CreateIndex(
                name: "idx_reactions_unique",
                table: "reactions",
                columns: new[] { "user_id", "target_type", "target_id", "emoji" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reactions_ThreadId",
                table: "reactions",
                column: "ThreadId");

            migrationBuilder.CreateIndex(
                name: "idx_replies_thread",
                table: "replies",
                columns: new[] { "thread_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_replies_author_id",
                table: "replies",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_replies_parent_reply_id",
                table: "replies",
                column: "parent_reply_id");

            migrationBuilder.CreateIndex(
                name: "idx_threads_auto_delete",
                table: "threads",
                column: "auto_delete_at",
                filter: "auto_delete_at IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "idx_threads_channel_created",
                table: "threads",
                columns: new[] { "channel_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_threads_created",
                table: "threads",
                column: "created_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_threads_author_id",
                table: "threads",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email_hash",
                table: "users",
                column: "email_hash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reactions");

            migrationBuilder.DropTable(
                name: "replies");

            migrationBuilder.DropTable(
                name: "threads");

            migrationBuilder.DropTable(
                name: "channels");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
