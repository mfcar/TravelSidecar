using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceActivitySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_JourneyActivity_JourneyActivityId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivity_AspNetUsers_UserId",
                table: "JourneyActivity");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivity_Currency_CurrencyCode",
                table: "JourneyActivity");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivity_Journeys_JourneyId",
                table: "JourneyActivity");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivity_Tags_TagId",
                table: "JourneyActivity");

            migrationBuilder.DropIndex(
                name: "IX_Files_JourneyActivityId",
                table: "Files");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JourneyActivity",
                table: "JourneyActivity");

            migrationBuilder.DropColumn(
                name: "JourneyActivityId",
                table: "Files");

            migrationBuilder.RenameTable(
                name: "JourneyActivity",
                newName: "JourneyActivities");

            migrationBuilder.RenameColumn(
                name: "Location",
                table: "JourneyActivities",
                newName: "Notes");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivity_UserId",
                table: "JourneyActivities",
                newName: "IX_JourneyActivities_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivity_TagId",
                table: "JourneyActivities",
                newName: "IX_JourneyActivities_TagId");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivity_JourneyId",
                table: "JourneyActivities",
                newName: "IX_JourneyActivities_JourneyId");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivity_CurrencyCode",
                table: "JourneyActivities",
                newName: "IX_JourneyActivities_CurrencyCode");

            migrationBuilder.AddColumn<int>(
                name: "ActivityType",
                table: "JourneyActivities",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "JourneyActivities",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "JourneyActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CurrencyCode1",
                table: "JourneyActivities",
                type: "character varying(3)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DayNumber",
                table: "JourneyActivities",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EndLocation",
                table: "JourneyActivities",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EndTimezone",
                table: "JourneyActivities",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifiedByUserId",
                table: "JourneyActivities",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManualSortOrder",
                table: "JourneyActivities",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "JourneyActivities",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StartLocation",
                table: "JourneyActivities",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StartTimezone",
                table: "JourneyActivities",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypeSpecificData",
                table: "JourneyActivities",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "JourneyActivities",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_JourneyActivities",
                table: "JourneyActivities",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ActivityAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileMetadataId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityAttachments_Files_FileMetadataId",
                        column: x => x.FileMetadataId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActivityAttachments_JourneyActivities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "JourneyActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JourneyActivities_CreatedByUserId",
                table: "JourneyActivities",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JourneyActivities_CurrencyCode1",
                table: "JourneyActivities",
                column: "CurrencyCode1");

            migrationBuilder.CreateIndex(
                name: "IX_JourneyActivities_JourneyId_DayNumber_ManualSortOrder",
                table: "JourneyActivities",
                columns: new[] { "JourneyId", "DayNumber", "ManualSortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_JourneyActivities_JourneyId_StartDateTime_ManualSortOrder",
                table: "JourneyActivities",
                columns: new[] { "JourneyId", "StartDateTime", "ManualSortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_JourneyActivities_LastModifiedByUserId",
                table: "JourneyActivities",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityAttachments_ActivityId",
                table: "ActivityAttachments",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityAttachments_ActivityId_SortOrder",
                table: "ActivityAttachments",
                columns: new[] { "ActivityId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityAttachments_FileMetadataId",
                table: "ActivityAttachments",
                column: "FileMetadataId");

            migrationBuilder.AddForeignKey(
                name: "FK_Files_JourneyActivities_ActivityId",
                table: "Files",
                column: "ActivityId",
                principalTable: "JourneyActivities",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_AspNetUsers_CreatedByUserId",
                table: "JourneyActivities",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_AspNetUsers_LastModifiedByUserId",
                table: "JourneyActivities",
                column: "LastModifiedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_AspNetUsers_UserId",
                table: "JourneyActivities",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_Currency_CurrencyCode",
                table: "JourneyActivities",
                column: "CurrencyCode",
                principalTable: "Currency",
                principalColumn: "Code",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_Currency_CurrencyCode1",
                table: "JourneyActivities",
                column: "CurrencyCode1",
                principalTable: "Currency",
                principalColumn: "Code");

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_Journeys_JourneyId",
                table: "JourneyActivities",
                column: "JourneyId",
                principalTable: "Journeys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivities_Tags_TagId",
                table: "JourneyActivities",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_JourneyActivities_ActivityId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_AspNetUsers_CreatedByUserId",
                table: "JourneyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_AspNetUsers_LastModifiedByUserId",
                table: "JourneyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_AspNetUsers_UserId",
                table: "JourneyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_Currency_CurrencyCode",
                table: "JourneyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_Currency_CurrencyCode1",
                table: "JourneyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_Journeys_JourneyId",
                table: "JourneyActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyActivities_Tags_TagId",
                table: "JourneyActivities");

            migrationBuilder.DropTable(
                name: "ActivityAttachments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JourneyActivities",
                table: "JourneyActivities");

            migrationBuilder.DropIndex(
                name: "IX_JourneyActivities_CreatedByUserId",
                table: "JourneyActivities");

            migrationBuilder.DropIndex(
                name: "IX_JourneyActivities_CurrencyCode1",
                table: "JourneyActivities");

            migrationBuilder.DropIndex(
                name: "IX_JourneyActivities_JourneyId_DayNumber_ManualSortOrder",
                table: "JourneyActivities");

            migrationBuilder.DropIndex(
                name: "IX_JourneyActivities_JourneyId_StartDateTime_ManualSortOrder",
                table: "JourneyActivities");

            migrationBuilder.DropIndex(
                name: "IX_JourneyActivities_LastModifiedByUserId",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "ActivityType",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "CurrencyCode1",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "DayNumber",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "EndLocation",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "EndTimezone",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "LastModifiedByUserId",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "ManualSortOrder",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "StartLocation",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "StartTimezone",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "TypeSpecificData",
                table: "JourneyActivities");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "JourneyActivities");

            migrationBuilder.RenameTable(
                name: "JourneyActivities",
                newName: "JourneyActivity");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "JourneyActivity",
                newName: "Location");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivities_UserId",
                table: "JourneyActivity",
                newName: "IX_JourneyActivity_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivities_TagId",
                table: "JourneyActivity",
                newName: "IX_JourneyActivity_TagId");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivities_JourneyId",
                table: "JourneyActivity",
                newName: "IX_JourneyActivity_JourneyId");

            migrationBuilder.RenameIndex(
                name: "IX_JourneyActivities_CurrencyCode",
                table: "JourneyActivity",
                newName: "IX_JourneyActivity_CurrencyCode");

            migrationBuilder.AddColumn<Guid>(
                name: "JourneyActivityId",
                table: "Files",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_JourneyActivity",
                table: "JourneyActivity",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Files_JourneyActivityId",
                table: "Files",
                column: "JourneyActivityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Files_JourneyActivity_JourneyActivityId",
                table: "Files",
                column: "JourneyActivityId",
                principalTable: "JourneyActivity",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivity_AspNetUsers_UserId",
                table: "JourneyActivity",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivity_Currency_CurrencyCode",
                table: "JourneyActivity",
                column: "CurrencyCode",
                principalTable: "Currency",
                principalColumn: "Code");

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivity_Journeys_JourneyId",
                table: "JourneyActivity",
                column: "JourneyId",
                principalTable: "Journeys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyActivity_Tags_TagId",
                table: "JourneyActivity",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id");
        }
    }
}
