# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL
- Read "How to Solve Problems" below and apply it religiously, or you'll be fired.

## Project Overview

TravelSidecar is a trip planning application built with:
- **Backend**: .NET 9 with ASP.NET Core, Entity Framework Core, .NET Identity, PostgreSQL/PostGIS, NodaTime, OpenIddict
- **Frontend**: Angular 19 with Tailwind CSS 4 and Tailwind UI
- **Storage**: MinIO (S3-compatible) for file storage
- **Authentication**: .NET Identity and JWT with OpenIddict

## Project Structure

```
TravelSidecar/
├── server/                  # .NET 9 backend
│   ├── Api/                # Main API project
│   │   ├── Data/          # Database context, entities, migrations
│   │   ├── DTOs/          # Data transfer objects
│   │   ├── Endpoints/     # API endpoints (Minimal APIs)
│   │   ├── Services/      # Business logic services
│   │   ├── Builders/      # Entity builders (fluent API)
│   │   └── Extensions/    # Extension methods and configuration
│   ├── Api.Tests.Unit/     # Unit test project
│   │   ├── Helpers/       # Test utilities and data builders
│   │   ├── Services/      # Service layer tests
│   │   ├── Builders/      # Builder pattern tests
│   │   └── xunit.v3.runner.json  # Test configuration
│   └── TravelSidecarServer.sln
├── web-client/             # Angular 19 frontend
│   ├── src/app/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # Angular services
│   │   └── models/       # TypeScript interfaces/models
│   └── package.json
└── docker/                 # Docker configurations
```

## Development Commands

### Backend (.NET)

```bash
# Run the API locally
cd server/Api
dotnet run

# Database migrations
dotnet ef migrations add <MigrationName> --startup-project Api -o Data/Migrations
dotnet ef database update --startup-project Api

# Build
dotnet build

# Run unit tests
cd server
dotnet test

# Run tests with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run specific test project
dotnet test Api.Tests.Unit/Api.Tests.Unit.csproj

# Watch mode for tests
dotnet watch test --project Api.Tests.Unit
```

### Frontend (Angular)

```bash
cd web-client

# Install dependencies
npm install

# Run development server (proxies to backend on port 5300)
npm start

# Build for production
npm run build:prod

# Build and copy to .NET wwwroot
npm run build:dotnet

# Run linting
npm run lint

# Run tests
npm test

# Update version
npm run update-version
```

### Docker Development

```bash
# Start full development environment
docker compose -f docker/docker-compose.development.yml up -d

# Standalone Docker Commands for Testing

## PostgreSQL with PostGIS
# Note: Port 55000 is used to match appsettings.json configuration
docker run -d \
  --name travelsidecar-postgres \
  -p 55000:5432 \
  -e POSTGRES_DB=travelsidecar \
  -e POSTGRES_USER=travelsidecaru \
  -e POSTGRES_PASSWORD=travelsidecarpw \
  imresamu/postgis:17-3.5

# MinIO S3-compatible storage
docker run -d \
  --name travelsidecar-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minio \
  -e MINIO_ROOT_PASSWORD=minio123 \
  quay.io/minio/minio:latest \
  server /data --console-address ":9001"

# Create MinIO bucket after starting MinIO
# Access MinIO console at http://localhost:9001 (login: minio/minio123)
# Or use MinIO Client (mc):
docker run --rm --network host minio/mc alias set myminio http://localhost:9000 minio minio123
docker run --rm --network host minio/mc mb myminio/travelsidecar-dev

# Stop and remove containers
docker stop travelsidecar-postgres travelsidecar-minio
docker rm travelsidecar-postgres travelsidecar-minio
```

### Dev Container (VS Code)

The project includes a fully configured development container for VS Code that provides a complete development environment.

**Features:**
- .NET 9.0 SDK with Entity Framework Core tools
- Node.js 20.x with Angular CLI 19
- PostgreSQL with PostGIS extension
- MinIO S3-compatible storage
- Docker-in-Docker support
- Pre-configured VS Code extensions

**Quick Start:**
1. Install Docker Desktop and VS Code Dev Containers extension
2. Open project in VS Code
3. Click "Reopen in Container" when prompted
4. Wait for container build (first time takes several minutes)

**Services in Dev Container:**
- Angular: http://localhost:4200
- .NET API: http://localhost:5300 (HTTP) / http://localhost:5301 (HTTPS)
- MinIO Console: http://localhost:9001 (login: minio/minio123)
- PostgreSQL: localhost:55000 (user: travelsidecaru, password: travelsidecarpw)

See `.devcontainer/README.md` for detailed information.

## Architecture Overview

### Backend Architecture

1. **Minimal APIs Pattern**: The backend uses .NET Minimal APIs with endpoints organized in the `Endpoints/` folder
2. **Entity Framework Core**: Database access with PostgreSQL/PostGIS support using Npgsql
   - **Entities**: Located in `Data/Entities/`
   - **DbContext**: Configured in `Data/ApplicationDbContext.cs`
   - **Migrations**: Managed with EF Core migrations in `Data/Migrations/`
3. **Service Layer**: Business logic separated into services (`Services/` folder)
4. **Authentication**: JWT-based authentication with OpenIddict for OAuth/OIDC support
5. **File Storage**: Abstracted file storage with S3/MinIO implementation
6. **Health Checks**: Comprehensive health check endpoints for monitoring
7. **Rate Limiting**: Configured for API endpoints to prevent abuse
8. **NodaTime**: Used for date/time handling to avoid timezone issues
9. **PostGIS/PostGIS**: Database with PostGIS extension for geospatial data support, give preference to geography(Point,4326) type when necessary 

### Frontend Architecture

1. **Standalone Components**: Angular 19 with standalone components (no modules) and Zoneless change detection
2. **Change Detection**: OnPush strategy for all components
3. **Proxy**: Proxy configuration for API requests in development (`proxy.conf.json`)
4. **State Management**: Service-based state management with RxJS
5. **UI Components**: Reusable components with Tailwind CSS 4 and Tailwind UI styling
   - Primary color: Sky (Tailwind CSS)
   - Tag colors: Full Tailwind palette (22 colors)
6. **Authentication**: JWT interceptor and auth guards
7. **Internationalization**: Built-in i18n support for multiple languages using the native Angular i18n system
8. **Iconography**: Uses FontAwesome trough the `@fortawesome/angular-fontawesome` package
9. **Routing**: Lazy-loaded routes organized by feature areas
    - **admin.route.ts**: Admin dashboard and management pages, only accessible to users with admin role
    - **journey.route.ts**: Journey management pages, accessible to authenticated users, lazy-loaded for performance
    - **user-features.route.ts**: User profile and settings pages, accessible to authenticated users
    - **app.route.ts**: Main application routes, lazy-loaded for performance, other public pages 
10. 

### Key Patterns

1. **DTOs**: Separate request/response models for API endpoints
2. **Builders**: Builder pattern for complex entity creation
3. **Extensions**: Extension methods for service registration and configuration
4. **Pagination**: Standardized pagination with `PaginatedResult<T>`
5. **Error Handling**: Global error handling with problem details

## Unit Testing

### Testing Framework
- **xUnit v3**: Modern testing framework with Microsoft.Testing.Platform (MTP)
- **FluentAssertions**: Readable assertion syntax
- **Entity Framework Core In-Memory**: Database testing without external dependencies
- **NSubstitute**: Mocking framework for isolated testing

### Test Project Structure
```
Api.Tests.Unit/
├── Helpers/
│   └── TestDataBuilder.cs      # Factory methods for test entities
├── Services/                    # Service layer tests
│   ├── TagServiceTests.cs
│   ├── JourneyCategoryServiceTests.cs
│   └── ...
├── Builders/                    # Builder pattern tests
│   ├── JourneyBuilderTests.cs
│   └── ...
└── xunit.v3.runner.json        # Test configuration
```

### Test Data Builder
The `TestDataBuilder` class provides factory methods for creating test entities with sensible defaults:

```csharp
// Create a tag with Tailwind color
var tag = TestDataBuilder.CreateTag(userId, "Adventure", color: "blue");

// Create a journey with optional parameters
var journey = TestDataBuilder.CreateJourney(userId, 
    name: "European Trip",
    startDate: new LocalDate(2024, 7, 1));
```

### Entity Testing Patterns

**Timestamp Testing**
- Entities track `CreatedAt`, `LastModifiedAt` (or `UpdatedAt` for some entities)
- Soft delete pattern with `IsDeleted` and `DeletedAt`
- Tests verify timestamp preservation during operations

**Tailwind Color System**
Tags use Tailwind CSS color names instead of hex codes:
```csharp
private static readonly string[] TailwindColors = 
{
    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
    "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink",
    "rose", "slate", "gray", "zinc", "neutral", "stone"
};
```

### Service Testing Patterns

**In-Memory Database Setup**
```csharp
private ApplicationDbContext CreateDbContext()
{
    var options = new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;
    return new ApplicationDbContext(options);
}
```

**Service Isolation**
- Each test uses a fresh database instance
- Tests are independent and can run in parallel
- No shared state between tests

**Common Test Scenarios**
1. CRUD operations validation
2. Business rule enforcement
3. Soft delete behavior
4. Duplicate prevention
5. User authorization checks
6. Caching behavior (for services with memory cache)

### Builder Pattern Testing

Builders use fluent API for entity construction:
```csharp
var journey = new JourneyBuilder(userId, "My Trip")
    .WithDescription("Amazing adventure")
    .WithStartDate(new LocalDate(2024, 7, 1))
    .WithEndDate(new LocalDate(2024, 7, 15))
    .WithCategory(categoryId)
    .WithTags(tags)
    .Build();
```

**Builder Test Coverage**
- Required field validation
- Optional field handling
- Null/empty value handling
- Business rule enforcement (e.g., end date must be after start date)
- Fluent API chaining

### Testing Conventions

**Naming Conventions**
- Test classes: `[ClassName]Tests`
- Test methods: `[MethodName]_Should[ExpectedBehavior]_When[Condition]`
- Example: `CreateAsync_ShouldThrowException_WhenDuplicateName`

**Test Organization**
- Arrange-Act-Assert pattern
- One assertion focus per test
- Descriptive test names that document behavior

**Test Categories**
1. **Unit Tests**: Isolated component testing
2. **Integration Tests**: Component interaction testing (future)
3. **End-to-End Tests**: Full workflow testing (future)

### Service-Specific Testing Patterns

**Cached Services**
Services like `ApplicationSettingsService` use memory caching:
- Test cache hit/miss scenarios
- Verify cache invalidation
- Test concurrent access patterns

**User-Scoped Services**
Services like `TagService`, `JourneyCategoryService`:
- Test user isolation (users can't access other users' data)
- Test admin override capabilities
- Verify soft delete filtering

**Version History Service**
Tracks application version installations:
- Test version ordering
- Test duplicate version handling
- Verify installation timestamp accuracy

### Best Practices

1. **Test Data Isolation**: Each test creates its own test data
2. **Async Testing**: Use `async Task` for async method testing
3. **FluentAssertions**: Prefer readable assertions
   ```csharp
   result.Should().NotBeNull();
   result.Name.Should().Be("Expected Name");
   ```
4. **Edge Cases**: Test null, empty, whitespace, and boundary values
5. **Error Scenarios**: Test exception cases and error messages
6. **Performance**: Keep tests fast with in-memory database

## Database Schema

The application uses PostgreSQL with PostGIS extension. Key entities:
- `ApplicationUser` - User accounts with preferences (timezone, date/time format, currency)
- `Journey` - Trip/journey records (optional start/end dates)
- `JourneyActivity` - Activities within journeys (with timezone-aware dates)
- `JourneyCategory` - Categories for organizing journeys (with optional description)
- `Tag` - Tags for categorization (uses Tailwind CSS color names)
- `BucketListItem` - Bucket list items for future trips (with `UpdatedAt` timestamp)
- `BucketList` - Container for bucket list items (with required name)
- `FileMetadata` - File storage metadata
- `Currency` - Currency reference data
- `InstalledVersion` - Application version history tracking
- `ApplicationSetting` - System-wide configuration storage

### User Preferences
Users can configure:
- Preferred timezone (IANA timezone ID)
- Date format (13 different formats including international)
- Time format (12-hour or 24-hour)
- First day of week
- Preferred currency
- Theme mode (light/dark/system)
- Language

## Configuration

### Backend Configuration
- Database connection: `appsettings.json` → `DatabaseConfiguration`
- File storage: `appsettings.json` → `FileStorage`
- JWT settings: `appsettings.json` → `Jwt`

### Frontend Configuration
- API URL: `environments/environment.ts` → `apiBaseUrl`
- Proxy configuration: `proxy.conf.json` (for development)

## Common Development Tasks

### Adding a New API Endpoint
1. Create endpoint class in `server/Api/Endpoints/[Feature]/`
2. Implement the endpoint handler
3. Register in `Extensions/EndpointExtensions.cs`

### Adding a New Angular Component
1. Generate with: `ng generate component components/[name]`
2. Components are created with OnPush change detection and inline styles by default

### Adding a New Angular Page
1. Generate with: `ng generate component pages/[name] --type=Page`
2. Pages are created with OnPush change detection and inline styles by default

### Adding a New Service
1. Backend: Create in `server/Api/Services/` and register in `ServiceExtensions.cs`
2. Frontend: Create in `web-client/src/app/services/`

### Database Changes
1. Modify entities in `server/Api/Data/Entities/`
2. Create migration: `dotnet ef migrations add [Name] --startup-project Api -o Data/Migrations`
3. Migrations are applied automatically on startup

## Component Structure

### Forms (`/components/forms/`)
- Input components: `text-input`, `textarea-input`, `date-only-input`, `time-only-input`
- Selectors: `currency-select`, `currency-price-input`, `tags-selector-input`
- Custom controls: `color-selector-input`, `generic-selector-input`

### Activities (`/components/activities/`)
- `activities-view-toggle` - Toggle between time/manual sorting
- `day-activities-list` - Display activities for a specific day

### Navigation (`/components/navigation/`)
- `days-navigator` - Main navigation component for journey days
- Calendar views: `activity-calendar-view`, `calendar-view`
- Pagination views: `activity-pagination-view`, `pagination-view`

### Modals (`/components/modals/`)
- Organized by feature: `bucketList/`, `journeyCategories/`, `journeys/`, `tags/`, `users/`
- Base modal component for consistency

### CRUD Page Components
- **View Modes**: `ts-grid-list`, `ts-stack-list`, `ts-table-list`
- **Tools**: `ts-view-mode-toggle`, `ts-sort-options`, `ts-field-display-selector`
- **Layout**: `ts-sticky-list-tools` - Container for filters and tools

### Tag System
- Tags can be applied to journeys, bucket list items, and future entities
- Tag detail pages show all related items
- Designed for quick navigation to tagged content

## Icon Management

### IconRegistryService
- Located at `/services/icon-registry.service.ts`
- Uses `@fortawesome/angular-fontawesome` with lazy loading
- Register all icons in `registerIcons()` method
- Called during app initialization to support lazy-loaded routes
- Example icons: `faPlane`, `faTags`, `faCalendar`, etc.

### Adding New Icons
```typescript
// In IconRegistryService.registerIcons()
import { faNewIcon } from '@fortawesome/free-solid-svg-icons';
this.library.addIcons(faNewIcon);
```

## CRUD Page Architecture

### View Modes
- **Grid View**: Card-based layout with images
- **Stack View**: Compact list with key fields
- **Table View**: Traditional data table

### User Preferences per Page
Each CRUD page saves:
- Selected view mode
- Sort field and order
- Visible fields selection
- Items per page

Example implementation:
```typescript
// Define preference key
userPreferencesKey = PreferenceKeys.PageTags;

// Load preferences in constructor
const pagePrefs$ = this.userPrefService.getPagePreferences(this.userPreferencesKey, {
  viewMode: this.selectedViewMode(),
  sortBy: this.selectedSortBy(),
  sortOrder: this.selectedSortOrder(),
  selectedFields: Array.from(this.selectedFields())
});
```

### Preference Keys
- `PageBucketList` - Bucket list items page
- `PageTags` - Tags list page
- `PageJourneys` - Journeys list page
- `PageJourneyCategories` - Journey categories page
- `PageUsers` - Users management page

## Backend Extensions Pattern

### Service Extensions
- Located in `/server/Api/Extensions/`
- Organize service registration by concern
- Used in `Program.cs` with clean method calls

Key extensions:
- `ServiceExtensions.cs` - Application services
- `DatabaseExtensions.cs` - EF Core and migrations
- `CorsExtensions.cs` - CORS configuration
- `HealthCheckExtensions.cs` - Health monitoring
- `RateLimitExtensions.cs` - Rate limiting
- `OpenIddictExtensions.cs` - OAuth/OIDC setup
- `BlobStorageExtensions.cs` - File storage

### Project Configuration

**Directory.Build.props**
- Shared project settings across all projects
- Sets: TargetFramework (net9.0), Nullable, ImplicitUsings

**Directory.Packages.props**
- Central package version management
- All NuGet package versions in one place
- Enables `ManagePackageVersionsCentrally`

## Build & Deployment

### Angular Build Process
```bash
# Development
npm start                    # Runs on port 4200 with proxy

# Production build
npm run build:prod          # Builds optimized version
npm run build:dotnet        # Builds and copies to wwwroot
```

### Docker Architecture

**Development** (`docker-compose.development.yml`):
- Builds from source with Dockerfile
- Exposes ports: App (3590/3591), DB (55432), MinIO (9000/9001)
- Uses volumes for data persistence

**Production** (`docker-compose.production.yml`):
- Uses pre-built images
- Environment variable support
- `restart: unless-stopped` policy
- Named volumes for production data

### Dockerfile Strategy
1. Build Angular app in node container
2. Build .NET app in SDK container
3. Copy Angular dist to wwwroot
4. Create minimal runtime image

## Important Notes

- The application serves the Angular SPA from the .NET backend in production
- Authentication uses JWT tokens with OpenIddict for OAuth support
- File uploads are handled through MinIO/S3-compatible storage
- The application includes comprehensive health checks at `/health/live` and `/health/ready`
- Rate limiting is configured for API endpoints
- CORS is configured in `Extensions/CorsExtensions.cs`
- User preferences affect all date/time displays, formatting, and timezone handling
- The application is internationalized and supports multiple languages
- Uses Tailwind CSS 4 with Sky as the primary color
- All components use OnPush change detection strategy
- SPA fallback configured to serve index.html for client routes
- Unit tests use xUnit v3 with Microsoft.Testing.Platform (MTP)
- Tags use Tailwind CSS color names (not hex codes) from a predefined palette
- All entities support soft delete with `IsDeleted` and `DeletedAt` fields
- Builder pattern used for complex entity creation with fluent API

## Angular Development Guidelines

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.
### TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
### Angular Best Practices
- Always use standalone components over NgModules
- Don't use explicit `standalone: true` (it is implied by default)
- Use signals for state management
- Implement lazy loading for feature routes
- Use `NgOptimizedImage` for all static images.
### Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead
### State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
### Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
### Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Detail Pages Pattern

### Journey Category & Tag Details
- Show statistics (counts of related items)
- List all related journeys
- Direct navigation to related content
- Edit capabilities for the main entity

Example structure:
```typescript
// Load entity with related data
tagResource = rxResource({
  request: () => this.tagId(),
  loader: ({ request: id }) => this.tagService.getTagById(id!)
});

// Display related items
@for (journey of tag()!.journeysList; track journey.id) {
  // Show journey with link
}
```

## Planning & Documentation

Claude Code uses local planning documents stored in `.claude/` directory (excluded from git).
- Planning documents: `.claude/plans/`
- Backup files: `.claude/summaries/CLAUDE.backup-YYYY-MM-DD-HH-MM.md`

When creating backups, always include hour/minute and use `.md` extension for easy viewing.

## How to Solve Problems
- Say "woof" to acknowledge you've read this before every edit.
- Plan every change! This is mathematics. You *need* to plan. Don't just rush with edits. Make every edit meaningful.
- Always restate the problem before any change to the code.
- If something didn't work out, summarize *why* it didn't work out first.
- Keep track of whether your high-level* approach makes sense.
- When "fixing" the code, always determine whether you're sticking with the previous high-level approach or if there was a flaw in it. If there was a flaw, write down the flaw clearly, and how much you need to repair.
- Examine the goal state on different lines, see what theorems are avaiable, hover on things to learn their types. Use all of this information when planning the next step.
- Try to keep the file green. It's better to add 'sorry's than bad solutions. If you see a bunch of diagnostic failures, make a smaller change, then fix sorry's.
- It's okay to get diagnostic errors. Just go through them methodically and determine for each whether it signals a flaw in the big strategy or a small mistake. Use that when planning the next change.
- Try to 'rw things, 'apply' things, 'simp' things, see what completions are available inside and which ones fix the diagnostics.
- Remind yourself to be methodical all the time.

WHEN YOU ENCOUNTER ERRORS

CORRECT APPROACH:

- Understand WHY the error exists
- Fix the root cause of the error
- Research the proper solution if needed
- Ask for help if genuinely stuck

## CODE GENERATION RULES

Quality Standards

- Write idiomatic, modern code with minimal dependencies
- Prioritize long-term maintainability over speed
- All code must pass ALL validation checks WITHOUT disabling any rules
- Test coverage for all critical functionality

COMMUNICATION STYLE

- Skip ALL flattery and praise
- Challenge assumptions and present counter-evidence
- Disagree openly when appropriate
- Be direct and professional

Problem Solving Approach

- For small tasks (small errors, minor tweaks) proceed directly with implementation when the scope and approach are clear. Ask clarifying questions if needed.

For Substantial Features and Changes:

- Act as a Socratic dialogue partner and rubber duck
- Assume the user may not have complete clarity on their vision
- Act as a product manager / senior designer who cares about the final user experience
- Guide the conversation toward concrete, actionable requirements
- Before writing any implementation plans or code:
- Ask clarifying questions about the intended user experience
- Only ask one focused question at a time
- Clarify edge cases and expected behaviors

Feature Implementation Plan Standards

When creating implementation plans for a single feature:

- Keep the plan scoped to only that feature.
- Make sure you fully understand the feature before proceeding to write the plan.
- Ask the user questions to clarify your understanding. The user often won't have figured out all the details of a feature before they begin to build it. You - should act like an expert product manager and help them think through the user experience and technical implementation of each feature.
- New plans should be markdown files stored inside the ".claude/plans" folder. Create this folder if it doesn't exist yet.
- IMPORTANT: These rules apply to code reviews and bugfixes as well.