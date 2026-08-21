You are a senior full-stack software engineer specializing in React/TypeScript, FastAPI, SQLAlchemy, REST API architecture, AI integrations, real-time telemetry systems, and production-quality application architecture.

You are working on the existing SmartMine project:

SmartMine is a research-oriented full-stack prototype for intelligent mining fleet management. The system is designed for mining truck drivers and mine operators and includes:

- Driver authentication
- Driver dashboard
- Truck and vehicle health monitoring
- Telemetry
- Driver performance evaluation
- Performance scoring
- Dynamic dispatch recommendation
- Mission management
- AI assistant
- AI-powered recommendations
- Predictive maintenance / vehicle health
- Mining fleet simulation
- Driver comparison
- Notifications
- Profile
- Historical and operational analytics

The repository already contains both:

- FastAPI backend
- React + TypeScript frontend

The backend has an existing layered architecture involving routers, services, repositories, models, schemas, algorithms, AI services, simulation, telemetry, etc.

The frontend already has an API service layer, TypeScript types, pages, hooks, context/state management, and UI components.

IMPORTANT:

DO NOT rewrite the project from scratch.

DO NOT replace the existing architecture unnecessarily.

DO NOT remove existing working functionality just to simplify implementation.

Your job is to carefully inspect the current implementation, understand the existing architecture, identify where the frontend still uses mock/hardcoded/demo data, and turn the current application into a genuinely integrated full-stack system.

The final application should behave as a coherent system:

React / TypeScript
        ↓
API Client
        ↓
FastAPI
        ↓
Services
        ↓
Algorithms / AI / Business Logic
        ↓
Repositories
        ↓
Database

The frontend should not pretend that backend functionality exists. If something is displayed as dynamic, it must actually come from the backend or from a clearly defined frontend-only UI state.

==================================================
PHASE 1 — FULL PROJECT AUDIT
==================================================

Before making changes, inspect the entire repository.

Analyze:

- backend structure
- frontend structure
- FastAPI routers
- services
- repositories
- models
- Pydantic schemas
- algorithms
- AI service
- database
- telemetry implementation
- simulation implementation
- authentication
- React pages
- React components
- API client
- hooks
- context/state
- TypeScript types
- mock data
- hardcoded values
- fallback data
- API response mapping
- tests

Pay special attention to:

smartmine-back/
smartmine-web/

Search the entire frontend for:

- mockData
- hardcoded metrics
- static recommendations
- fallback data
- Math.random()
- fake telemetry
- demo values
- static charts
- static performance trends
- static fleet states
- hardcoded mission states
- hardcoded AI messages
- placeholder API responses

Search the backend for:

- hardcoded business values
- driver-independent queries
- default driver IDs
- first-record selection
- hardcoded truck/crusher selection
- static telemetry
- incomplete mission state transitions
- incomplete persistence
- AI context bugs

Create an internal dependency map before changing code.

For every important UI value, determine:

1. Where it originates
2. Whether it is real backend data
3. Which endpoint provides it
4. Which service generates it
5. Which database entity stores it
6. Which frontend component consumes it

Do not modify anything until you understand these relationships.

==================================================
PHASE 2 — COMPLETE FRONTEND ↔ BACKEND INTEGRATION
==================================================

This is the highest-priority task.

The current project contains a mixture of real API-driven data and mock/hardcoded frontend data.

Remove this inconsistency.

Every piece of information presented to the user as operational, analytical, historical, or dynamic data must come from the backend.

Examples include:

- dashboard KPIs
- performance trends
- daily production
- cycle time trends
- vehicle health trends
- telemetry history
- fleet state
- shovel queues
- mission state
- dispatch state
- AI recommendations
- performance analysis
- predictive maintenance information
- notification state
- profile statistics
- comparison metrics

Do NOT simply delete mock data.

Instead:

1. Identify the corresponding backend source.
2. If the backend already exposes the required information, consume it from React.
3. If the backend does not expose the required information, add a proper API endpoint.
4. Implement the necessary service/repository/database logic.
5. Add/update Pydantic schemas.
6. Add TypeScript types.
7. Add API client methods.
8. Connect the React component to the API.
9. Handle loading/error/empty states.
10. Only keep mock data for an explicitly isolated offline/demo mode if necessary.

The normal application flow must NOT depend on mockData.ts.

Mock data must never silently appear when an API request fails.

If fallback/demo data is retained, it must be explicitly identifiable as:

"Demo Data"
or
"Offline Demo Mode"

Do not allow a backend failure to look like successful real data.

==================================================
PHASE 3 — DASHBOARD DATA
==================================================

Make the Dashboard genuinely backend-driven.

Remove hardcoded or mock values from:

- performance trends
- production trends
- cycle-time charts
- fleet statistics
- vehicle status
- current mission
- telemetry
- AI recommendation

The dashboard should use real API responses.

If historical performance data is needed and the backend currently lacks a suitable endpoint, implement one.

For example, create a suitable endpoint such as:

GET /api/v1/performance/history/{driver_id}

or another endpoint consistent with the existing API architecture.

Do not blindly add duplicate endpoints.

Reuse existing endpoints whenever possible.

The dashboard should represent the actual logged-in driver and truck.

Do not rely on default hardcoded IDs such as:

D-102

unless they are strictly part of an explicit demo mode.

==================================================
PHASE 4 — FIX AI PERFORMANCE QUERY
==================================================

Fix the AI context builder so that performance information is always filtered by the correct driver.

Current behavior must be audited carefully.

The AI request contains:

- driver_id
- truck_id

The performance query must use the provided driver ID.

Do NOT use:

- latest global performance record
- first performance record
- default driver
- arbitrary record

The correct flow must be:

AI request
    ↓
driver_id
    ↓
performance repository
    ↓
performance records belonging to that driver
    ↓
latest relevant performance
    ↓
AI context
    ↓
AI response

If the repository currently exposes something like:

latest()

change it appropriately to support filtering, e.g.:

latest(driver_id=...)

or another clean architecture consistent with the current repository pattern.

Also verify that:

- telemetry belongs to the correct truck
- performance belongs to the correct driver
- maintenance state belongs to the correct truck
- mission context belongs to the correct driver/truck where appropriate

Avoid cross-user or cross-truck data leakage.

Add regression tests specifically proving that an AI request for Driver A cannot receive Driver B's performance record.

==================================================
PHASE 5 — REMOVE HARDCODED DASHBOARD AI RECOMMENDATION
==================================================

The Dashboard AI recommendation must no longer be hardcoded.

Do NOT use static strings such as:

"Based on current queue conditions, shovel 03 is recommended."

The recommendation must originate from backend business logic.

Preferred architecture:

Dashboard
    ↓
FastAPI dashboard endpoint
    ↓
Dispatch / AI service
    ↓
Current fleet state
    ↓
Current queues
    ↓
Current truck state
    ↓
Current mission
    ↓
Recommendation
    ↓
React

Reuse the existing AI/dispatch infrastructure when possible.

Do not unnecessarily invoke GenAI for deterministic operational decisions.

For operational dispatch recommendations, deterministic algorithms should remain the source of truth.

GenAI may be used to:

- explain the recommendation
- summarize the situation
- provide natural-language reasoning
- generate driver-friendly advice

For example:

Backend:
{
  recommendation: {
    shovel_id: "S-03",
    confidence: 0.87,
    reason_codes: [
      "LOW_QUEUE",
      "SHORT_DISTANCE",
      "GOOD_AVAILABILITY"
    ]
  },
  explanation: "..."
}

React should render the backend response.

If AI is unavailable, the system should still provide a deterministic algorithmic recommendation rather than fake text.

==================================================
PHASE 6 — FIX DISPATCH APPLY
==================================================

Review the entire dispatch recommendation and apply flow.

Current implementation must be audited for:

- hardcoded crusher selection
- hardcoded distance
- static mission information
- first-record selection
- incorrect truck assignment
- incorrect shovel assignment
- missing persistence
- incomplete mission creation
- inconsistent state

Do NOT select a crusher simply because it is the first database record.

Do NOT use fixed values such as:

distance_km = 2.3

unless that is explicitly generated by a proper calculation.

The Apply operation must use the actual recommendation.

Expected flow:

Driver / System
    ↓
Dispatch Recommendation
    ↓
Selected Truck
    ↓
Selected Shovel
    ↓
Selected Crusher / Destination
    ↓
Calculated route/distance
    ↓
Mission creation/update
    ↓
Database persistence
    ↓
Updated fleet state
    ↓
Updated dashboard
    ↓
Updated React UI

After applying a recommendation:

- mission must be persisted
- relevant truck state must be updated
- relevant shovel/crusher state must be updated if applicable
- dashboard should reflect the new mission
- dispatch page should reflect the updated assignment
- mission lifecycle should start from the correct state

The Apply operation must be idempotent or protected against accidental duplicate submissions where appropriate.

Return a clear response containing:

- mission ID
- truck ID
- shovel ID
- crusher/destination ID
- route/distance
- estimated cycle time
- mission status
- created timestamp

Update TypeScript types accordingly.

==================================================
PHASE 7 — IMPLEMENT A COMPLETE MISSION LIFECYCLE
==================================================

The mission model should represent a realistic mining truck mission lifecycle.

Do not leave the system with only superficial states such as:

READY
IN_PROGRESS
WAITING

Design a clean lifecycle consistent with the existing project.

A possible lifecycle is:

ASSIGNED
    ↓
EN_ROUTE_TO_SHOVEL
    ↓
WAITING_FOR_LOADING
    ↓
LOADING
    ↓
HAULING
    ↓
WAITING_FOR_DUMP
    ↓
DUMPING
    ↓
COMPLETED

Also support:

CANCELLED
FAILED

if appropriate.

Do not blindly copy this list if the current domain model suggests a better state machine.

Implement explicit transition rules.

For example:

ASSIGNED
→ EN_ROUTE_TO_SHOVEL

EN_ROUTE_TO_SHOVEL
→ WAITING_FOR_LOADING

WAITING_FOR_LOADING
→ LOADING

LOADING
→ HAULING

HAULING
→ WAITING_FOR_DUMP

WAITING_FOR_DUMP
→ DUMPING

DUMPING
→ COMPLETED

Invalid transitions must be rejected.

Do not allow:

COMPLETED
→ LOADING

or other impossible transitions.

Implement this using proper business logic, not frontend-only state changes.

The backend must be the source of truth.

Expose appropriate endpoints, such as:

POST /missions/{mission_id}/transition

or another route consistent with the existing architecture.

The response should include the updated mission.

React should consume the backend mission state.

The Dashboard, Dispatch page, and relevant telemetry/mission components must reflect lifecycle changes.

Add tests for:

- valid transitions
- invalid transitions
- completion
- cancellation
- duplicate transition attempts

==================================================
PHASE 8 — MAKE TELEMETRY MORE DYNAMIC
==================================================

Improve the existing telemetry simulation.

The current telemetry implementation should not simply return static or barely changing values.

Create a deterministic but realistic simulation model.

Telemetry should evolve over time based on the truck's current operational state.

Potential telemetry values:

- engine temperature
- engine RPM
- fuel level
- fuel consumption
- speed
- vibration
- oil pressure
- payload
- GPS position
- distance traveled
- brake events
- idle time
- cycle time

Telemetry should be influenced by mission state.

For example:

EN_ROUTE_TO_SHOVEL
→ speed increases
→ fuel consumption increases
→ GPS position changes

WAITING_FOR_LOADING
→ speed approaches zero
→ idle time increases
→ engine remains active

LOADING
→ speed remains zero
→ payload increases

HAULING
→ payload is high
→ fuel consumption increases
→ GPS position changes

DUMPING
→ payload decreases
→ speed approaches zero

COMPLETED
→ mission metrics are finalized

Avoid using completely random values.

Use controlled simulation with:

- bounded changes
- realistic ranges
- deterministic state transitions
- small temporal variation

For example, use previous telemetry as the basis for the next sample.

Do not allow:

temperature = Math.random() * 100

style unrealistic behavior.

Instead:

previousTemperature
    ↓
operational state
    ↓
small bounded delta
    ↓
new temperature

The telemetry endpoint should persist important telemetry history if the existing architecture supports it.

The frontend should visualize actual backend telemetry.

Do not maintain a separate fake telemetry engine inside React.

The frontend should only request/poll/subscribe to telemetry from the backend.

If appropriate, implement configurable polling.

Avoid excessive API calls.

Prefer a reasonable interval such as 2–5 seconds for demo mode, unless the architecture requires otherwise.

==================================================
PHASE 9 — FRONTEND STATE MANAGEMENT
==================================================

Review the current AppStateContext.

Do not unnecessarily keep all server state inside one giant React context.

Where appropriate, move server-state concerns toward a modern data-fetching solution such as TanStack Query.

Use it where it materially improves:

- caching
- refetching
- loading states
- error handling
- mutations
- invalidation
- synchronization

Do not rewrite the whole frontend if the current architecture works.

Prioritize correctness and maintainability over introducing libraries for the sake of being modern.

==================================================
PHASE 10 — ERROR HANDLING
==================================================

Do not silently swallow API errors.

Replace patterns such as:

try {
   ...
} catch {
   // keep existing state
}

with proper error handling.

Every API-driven page should support:

- loading
- success
- empty
- error

states.

If backend is unavailable:

Show a clear user-facing message.

Never silently display mock data and make it look like real backend data.

For example:

"ارتباط با سرور برقرار نشد"

or an appropriate English/Persian equivalent depending on the current UI language.

If offline/demo fallback exists, explicitly label it.

==================================================
PHASE 11 — INCREASE TEST COVERAGE
==================================================

Significantly improve backend and frontend test coverage.

Do not write superficial tests only to increase the coverage percentage.

Focus on meaningful business behavior.

Backend tests must cover:

AUTH
- login success
- login failure
- token behavior if JWT is implemented

PERFORMANCE
- correct score calculation
- edge cases
- invalid values
- driver isolation
- persistence

AI
- correct driver filtering
- correct truck filtering
- correct context generation
- AI failure fallback
- no cross-driver data leakage

DISPATCH
- recommendation generation
- correct scoring
- correct selected truck
- correct shovel
- correct destination
- apply operation
- persistence
- duplicate apply protection

MISSIONS
- valid lifecycle transitions
- invalid transitions
- completion
- cancellation
- persistence

TELEMETRY
- realistic value ranges
- state-dependent behavior
- changing values over time
- persistence if applicable

DASHBOARD
- correct aggregation
- correct driver
- correct truck
- recommendation generation

NOTIFICATIONS
- fetching
- mark as read
- mark all as read
- persistence

SIMULATION
- valid input
- invalid input
- output consistency

Frontend tests should cover important behavior such as:

- login
- API error state
- dashboard rendering
- performance form submission
- dispatch recommendation
- dispatch apply
- mission status changes
- telemetry updates
- AI assistant interaction

Do not test implementation details unnecessarily.

Prefer testing user-visible behavior and business rules.

==================================================
PHASE 12 — API CONTRACT CONSISTENCY
==================================================

Audit all Backend ↔ Frontend contracts.

For every endpoint verify:

- HTTP method
- URL
- request body
- query parameters
- response schema
- nullable fields
- enums
- naming conventions
- error responses

Ensure TypeScript types match Pydantic schemas.

Avoid duplicated incompatible types.

If a backend response changes, update the frontend API types and mappers.

Do not use:

any

unless absolutely unavoidable.

==================================================
PHASE 13 — DATA OWNERSHIP RULE
==================================================

Apply this rule throughout the project:

SERVER STATE:
- driver information
- truck information
- telemetry
- performance
- missions
- dispatch
- notifications
- health
- simulation results
- AI recommendations
- historical metrics

must come from the backend.

CLIENT STATE:
- modal open/closed
- selected tab
- input field state
- temporary UI state
- loading indicators
- presentation mode

may remain in React.

Do not duplicate server state unnecessarily in React.

==================================================
PHASE 14 — DEMO QUALITY
==================================================

This project is intended for a Bachelor's thesis demonstration.

The final flow should be extremely reliable.

A complete demo scenario should work like this:

1. User opens SmartMine.
2. User logs in as a mining truck driver.
3. Dashboard loads real backend data.
4. Current truck health is displayed.
5. Live telemetry updates dynamically.
6. User opens Performance.
7. User submits a shift performance report.
8. Backend calculates the performance score.
9. Result is persisted.
10. Dashboard reflects the updated performance.
11. User opens Dispatch.
12. Backend calculates a dispatch recommendation.
13. Recommendation is displayed.
14. User applies the recommendation.
15. Mission is created in the backend.
16. Mission status is visible in Dashboard.
17. Mission progresses through lifecycle states.
18. Telemetry changes according to mission state.
19. Vehicle health reflects telemetry.
20. AI Assistant can answer questions using the correct driver's data.
21. AI recommendations are based on actual backend state.
22. Simulation runs using real backend calculations.
23. Notifications reflect actual backend state.
24. Profile and comparison use backend data.

There must be no obvious "fake" behavior during this flow.

==================================================
PHASE 15 — DO NOT OVERENGINEER
==================================================

This is a research prototype, not a production mining control system.

Do not introduce unnecessary:

- microservices
- Kafka
- Redis
- WebSockets
- Kubernetes
- complex event buses
- distributed architecture

unless there is a concrete reason in the existing project.

A clean monolithic FastAPI architecture is completely acceptable.

For telemetry, polling is acceptable for this prototype.

For AI, GenAI can be used for explanations and assistant functionality, while deterministic algorithms should handle safety-critical or operational scoring decisions.

==================================================
PHASE 16 — CODE QUALITY
==================================================

Follow the existing architecture.

Use:

- clear naming
- typed Python
- Pydantic schemas
- TypeScript
- reusable services
- repository pattern
- dependency injection
- small focused functions
- meaningful exceptions
- structured logging

Avoid:

- duplicated business logic
- hardcoded IDs
- hardcoded operational values
- hidden fallback behavior
- giant functions
- business logic inside React components
- direct database access from routers
- API calls directly from random components

Keep business logic in the backend service/algorithm layer.

==================================================
PHASE 17 — DOCUMENTATION
==================================================

Update documentation after implementation.

Document:

- new endpoints
- mission lifecycle
- telemetry behavior
- AI context behavior
- dispatch logic
- frontend/backend architecture
- how to run the project
- how to run tests
- demo workflow

If there are environment variables, document them.

Do not expose API keys or secrets.

==================================================
PHASE 18 — FINAL VERIFICATION
==================================================

After implementation:

1. Run backend tests.
2. Run frontend tests.
3. Run type checking.
4. Run linting if configured.
5. Start FastAPI.
6. Start React.
7. Verify API communication.
8. Verify login.
9. Verify dashboard.
10. Verify performance flow.
11. Verify dispatch recommendation.
12. Verify dispatch apply.
13. Verify mission lifecycle.
14. Verify telemetry updates.
15. Verify AI assistant.
16. Verify AI driver filtering.
17. Verify simulation.
18. Verify notifications.
19. Verify profile.
20. Verify no important page depends on mock data.

Search the repository again for:

- mockData
- hardcoded recommendations
- hardcoded metrics
- fake telemetry
- default driver IDs
- default truck IDs
- Math.random() in business logic
- silent catch blocks
- TODO
- FIXME

Any remaining occurrence must be intentionally justified.

==================================================
FINAL ACCEPTANCE CRITERIA
==================================================

The implementation is considered complete only if:

[ ] React is genuinely connected to FastAPI.
[ ] Important UI data comes from backend APIs.
[ ] Mock data is removed from the normal production/demo flow.
[ ] API failures are visible to the user.
[ ] AI performance queries are correctly filtered by driver.
[ ] AI context does not mix data between drivers.
[ ] Dashboard AI recommendation is no longer hardcoded.
[ ] Dispatch Apply uses the actual recommendation.
[ ] Crusher/destination selection is not simply the first database record.
[ ] Distance is calculated rather than hardcoded.
[ ] Applied dispatch creates/persists a real mission.
[ ] Mission lifecycle is implemented and validated server-side.
[ ] Invalid mission transitions are rejected.
[ ] Dashboard reflects mission state.
[ ] Telemetry changes dynamically based on operational state.
[ ] Telemetry is backend-driven.
[ ] Performance results are persisted.
[ ] Performance result page uses real backend data.
[ ] Vehicle health uses backend telemetry/history.
[ ] Notifications are persisted correctly.
[ ] AI assistant receives correct driver/truck context.
[ ] TypeScript types match backend schemas.
[ ] Backend tests are significantly improved.
[ ] Frontend tests cover important user flows.
[ ] No secrets are committed.
[ ] Existing architecture remains clean.
[ ] Existing working functionality is preserved.
[ ] Project starts successfully.
[ ] Full demo workflow works end-to-end.

==================================================
IMPORTANT IMPLEMENTATION PRINCIPLE
==================================================

Do not optimize for "number of changed files".

Optimize for:

CORRECTNESS
+
REAL DATA FLOW
+
CONSISTENT ARCHITECTURE
+
TESTABILITY
+
DEMO RELIABILITY

The goal is not merely to make the UI look connected.

The goal is to make the entire SmartMine system genuinely work as one integrated application.

At the end, provide a concise implementation report containing:

1. What was changed
2. Which files were changed
3. Which APIs were added/modified
4. Which mock data was removed
5. How AI driver filtering was fixed
6. How Dashboard recommendation was implemented
7. How Dispatch Apply was fixed
8. How Mission lifecycle was implemented
9. How Telemetry was improved
10. What tests were added
11. Test results
12. Any remaining limitations
13. Exact commands needed to run the final project

Do not stop after making superficial changes.

Inspect, implement, test, verify, and only then report completion.
