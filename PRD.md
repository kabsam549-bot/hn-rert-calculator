# H&N Re-Irradiation Calculator — PRD

*Last updated: 2026-03-02*

---

## 1. Vision

The definitive clinical decision-support tool for head & neck re-irradiation. Two audiences, two pathways: **RadOnc** (granular dosimetric evaluation) and **Referring Physician** (60-second traffic-light output). Owned by **Jack Phan** clinically, built and maintained by **Rafiq** technically.

The admin panel turns this into a **living tool** that Phan can update himself — editing OAR constraints, dose regimens, guidelines, and references without touching code. Bigger changes go through a **ticket system** that Rafiq processes nightly.

---

## 2. Non-Goals

- **Not a treatment planning system.** No DICOM import, no contours, no plan optimization.
- **Not multi-institution.** MDACC-specific pathways and data. Other centers can use general pathway.
- **Not a patient portal.** No patient logins, no PHI storage, no HIPAA scope.
- **Not a case forum (yet).** Phan wants this eventually, but it's a separate project.
- **Not a personal website for Phan.** Separate project, distinct domain.
- **Not behind institutional auth.** Public tool with disclaimer. Admin panel is password-protected.

---

## 3. Success Criteria

### MVP (Phase 1) — "Phan can edit, Rafiq can build overnight"
- [ ] Phan logs into admin panel and edits an OAR constraint → change is live within 30 seconds
- [ ] Phan submits a ticket ("add lingual artery to OAR list") → Rafiq receives it → builds it overnight → Phan sees it next morning
- [ ] All 13 OAR constraints are editable (name, tier, limit, alpha/beta, complication)
- [ ] All 6 dose regimens are editable
- [ ] Guidelines text is editable (rich text, not raw HTML)
- [ ] References are editable (citation, DOI, category)
- [ ] Every edit has an audit trail (who, when, what changed)
- [ ] Ticket has status lifecycle: submitted → in-progress → done → verified

### Full (Phase 2+) — "Complete Phan feedback integration"
- [ ] All 50+ tasks from Feb 7 meeting implemented
- [ ] EQD2 calculator with tissue recovery and "room left" per organ
- [ ] Bleeding risk logic with IR referral triggers
- [ ] General pathway (multidisciplinary, non-dosimetric)
- [ ] Ana's 27x3 data integrated
- [ ] All outcome combinations validated by Phan
- [ ] Anatomical diagrams for bleeding risk

---

## 4. User Journeys

### Journey 1: Phan Edits Content Directly
1. Phan goes to headneckreirradiation.com/admin
2. Enters password → sees admin dashboard
3. Clicks "OAR Constraints" tab → sees table of all OARs
4. Changes brachial plexus limit from 60 to 66 Gy EQD2
5. Clicks "Save" → change persists immediately
6. Checks the live calculator → sees updated constraint
7. Edit log shows: "Jack Phan updated Brachial plexus limitEQD2: 60 → 66 (Mar 2, 2026 4:12 PM)"

### Journey 2: Phan Submits a Feature Ticket
1. Phan goes to /admin → clicks "Request a Change" tab
2. Fills out form:
   - **Title**: "Add lingual artery to OAR constraints"
   - **Description**: "Use same constraints as carotid for now. We contour them but no NTCP data yet."
   - **Priority**: Medium
   - **Category**: Clinical Parameters
3. Clicks "Submit" → sees confirmation with ticket #
4. That night at 1 AM, Rafiq's nightly cron picks up the ticket
5. Rafiq builds the feature, commits, deploys
6. Ticket status updates to "Done" with commit link
7. Next morning, Phan sees the lingual artery in the calculator and the ticket marked done

### Journey 3: Radiation Oncologist Uses Calculator
1. Arrives at homepage → accepts disclaimer
2. Clicks "MDACC Pathway" (RadOnc)
3. Enters: recurrent SCC, in-field, 18 months since prior RT, 45cc GTV, prior 70/33
4. MDACC pathway walks through histology → volume → prior dose → OAR budget
5. Sees: RPA Class II, EQD2 budget per organ, recommended regimen, bleeding risk flag
6. Exports summary as PDF or shares link

### Journey 4: Referring Surgeon Uses Calculator
1. Arrives at homepage → accepts disclaimer
2. Clicks "Referring Physician Guide"
3. Answers 2 questions (60 seconds)
4. Gets traffic-light output: GREEN/YELLOW/RED with plain-language recommendation
5. If YELLOW/RED: "Refer to radiation oncology for full evaluation"

---

## 5. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | Already in use, TypeScript, SSR |
| Styling | Tailwind CSS | Already in use |
| Content Storage | **Vercel KV (Redis)** | Free tier, persists across deploys, fast reads |
| Ticket Storage | **Notion API** | Already integrated, Ramez can see board, Phan can check status |
| Auth | Simple password (admin) | No user accounts needed. Single shared admin password. |
| Hosting | Vercel | Already deployed at headneckreirradiation.com |
| Repo | github.com/kabsam549-bot/hn-rert-calculator | Existing |

### Why Vercel KV for Content?
The current admin panel is a shell — edits don't persist (in-memory only, lost on every deploy/cold start). Vercel's filesystem is read-only in production. Vercel KV gives us:
- Persistent key-value storage (Redis under the hood)
- Free tier: 256MB, 30K requests/month (more than enough)
- No external database setup
- Reads from edge (fast)

### Why Notion for Tickets?
- Already have API integration (`~/.config/notion/api_key`)
- Ramez and Phan can both view/comment in Notion
- Rafiq's nightly cron can query the database for new tickets
- Status tracking (Submitted → In Progress → Done → Verified) is native to Notion
- No new infrastructure

---

## 6. Data Model

### Editable Content (Vercel KV)

```
Key: "hn-rert:content"
Value: {
  oarConstraints: OARConstraint[]
  doseRegimens: DoseRegimen[]
  guidelines: Guideline[]
  references: Reference[]
  mdaccPathwayConfig: {
    volumeThresholds: { favorable: 15, acceptable: 25, moderate: 50 }
    dfiThresholds: { poor: 24 }  // months
    histologyGroups: { ... }
  }
  bleedingRiskConfig: {
    irReferralThreshold: 5  // percent
    highRiskLocations: string[]
  }
  lastUpdated: string
  updatedBy: string
}

Key: "hn-rert:audit"
Value: AuditEntry[]  // append-only log
  { timestamp, author, field, oldValue, newValue }
```

### Ticket (Notion Database)

```
Database: "H&N Re-RT Tickets"
Properties:
  - Title (title)
  - Description (rich text)
  - Priority: Low | Medium | High | Critical (select)
  - Category: Clinical Parameters | Dosimetry | UI/UX | Data | Bug (select)
  - Status: Submitted | In Progress | Done | Verified (select)
  - Submitted By (text) — "Jack Phan" or "Ramez"
  - Submitted At (date)
  - Completed At (date)
  - Commit Link (url)
  - Notes (rich text) — Rafiq's implementation notes
```

### Existing Calculator Types (lib/types.ts)
Already defined: PatientData, TreatmentResults, OARConstraint, RPAClassification. These stay as-is — they're the calculation engine. The admin panel edits the *data* that feeds into them.

---

## 7. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                                                      │
│  /                  → Calculator (public)            │
│  /admin             → Admin Panel (password)         │
│  /admin/tickets     → Ticket submission + history    │
│                                                      │
├─────────────────────────────────────────────────────┤
│                    API ROUTES                         │
│                                                      │
│  GET  /api/content        → Read current content     │
│  PUT  /api/content        → Save content (admin)     │
│  GET  /api/audit          → Read audit log           │
│  POST /api/tickets        → Submit ticket to Notion  │
│  GET  /api/tickets        → List tickets from Notion │
│                                                      │
├─────────────────────────────────────────────────────┤
│                    STORAGE                            │
│                                                      │
│  Vercel KV  →  Content + Audit Log                  │
│  Notion     →  Tickets                               │
│  Code       →  Calculator logic (lib/)               │
│                                                      │
├─────────────────────────────────────────────────────┤
│                    NIGHTLY CRON                       │
│                                                      │
│  1:00 AM CST  →  Rafiq checks Notion for new tickets│
│              →  Builds features / fixes bugs         │
│              →  Commits, deploys, updates ticket     │
└─────────────────────────────────────────────────────┘
```

---

## 8. MVP vs Full

### Phase 1: Admin Panel + Ticket System (1-2 days)
- [ ] Set up Vercel KV (free tier)
- [ ] Migrate editable content from in-memory to KV
- [ ] Admin panel: OAR constraints CRUD with save-to-KV
- [ ] Admin panel: Dose regimens CRUD
- [ ] Admin panel: Guidelines editor (rich text)
- [ ] Admin panel: References editor
- [ ] Audit log: Every save writes to KV audit trail
- [ ] Audit log: Viewable in admin panel
- [ ] Create Notion ticket database
- [ ] Ticket submission form in admin panel
- [ ] Ticket list view with status filters
- [ ] API: POST /api/tickets → Notion
- [ ] API: GET /api/tickets → list from Notion
- [ ] Nightly cron job: query Notion for "Submitted" tickets, alert Rafiq

### Phase 2: Clinical Feedback — Quick Wins (2-3 days)
- [ ] Back button in pathway (navigate without resetting)
- [ ] Rename "post-op" → "salvage post-op"
- [ ] Change CTV/GTV → "Plan Target Volume (PTV)"
- [ ] Info/hover icons on key terms
- [ ] Disease-free interval field
- [ ] Flap reconstruction status
- [ ] Separate melanoma/sarcoma from non-squamous
- [ ] GTV volume thresholds: <15 / 15-25 / 25-50 / >50cc

### Phase 3: EQD2 Calculator Overhaul (3-5 days)
- [ ] Per-organ EQD2 from prior dose + fractionation
- [ ] Tissue recovery adjustment (6mo: -25%, 12mo+: -50%)
- [ ] "Room left" display per organ
- [ ] Input: prior dose, fx, reirradiation fx (2/3/4/5fx)
- [ ] Pull Jack's planning directive constraints
- [ ] Integrate brainstem, brachial plexus, carotid, cord, temporal lobe, lingual artery
- [ ] TCP adjustment for gross vs post-op disease

### Phase 4: General Pathway + Bleeding Risk (3-5 days)
- [ ] New general pathway flow (4 steps, non-dosimetric)
- [ ] MIRI calculator-style RPA output with PFS/OS data
- [ ] Bleeding risk logic (>5% triggers IR consult recommendation)
- [ ] Anatomical diagrams (AI-generated, nasopharynx/oropharynx/neck)
- [ ] Systemic therapy recommendation logic (regional + distant met risk)

### Phase 5: Data Integration + Validation (ongoing)
- [ ] Ana's 27x3 SBRT data (when available)
- [ ] Historical outcomes table (supportive care through proton era)
- [ ] Dose stratification by sub-site (Kevin Diao paper)
- [ ] Anderson IMRT/Proton 226-patient data
- [ ] Generate all input combinations → send to Phan for validation
- [ ] Outcomes by site verification with Phan

---

## 9. Open Questions

1. **Vercel KV vs Supabase?** KV is simpler but limited to key-value. If we need relational queries (e.g., "show me all tickets by category"), Supabase might be better. Decision: start with KV, migrate if needed.

2. **Admin auth upgrade?** Current hardcoded password is fine for MVP (Phan is the only admin). But if we add Ana or others, need proper auth. Future: magic link or Notion SSO.

3. **Content versioning?** If Phan makes a bad edit, can he roll back? MVP: audit log shows old values. Full: snapshot + restore.

4. **Offline/local editing?** Phan might want to edit on a plane. Not supported in MVP. Everything requires internet.

5. **How does Phan know his ticket is done?** Options: (a) email notification, (b) he checks the admin panel, (c) Rafiq messages Ramez who tells Phan. Decision: Start with (b), add email later.

6. **Should the calculator read content from KV on every page load?** Or cache in-memory with a TTL? Start with direct reads (Vercel KV is fast, edge-cached).

---

## 10. Current State

### What Works
- MDACC Pathway: 4 tabs (pathway, MIRI, OAR dose budget, guidelines)
- Histology: 3-way split (SCC, non-SCC, melanoma/sarcoma)
- Volume thresholds with risk stratification
- OAR dose budget calculator with EQD2 and tissue recovery
- Salvage pathway (referring physicians): 2-step traffic-light
- Disclaimer modal on first visit
- Admin panel shell (exists but doesn't persist edits)
- Basic editable content types defined (lib/editableContent.ts)

### What's Broken / Incomplete
- **Admin saves are in-memory only** — lost on every deploy or cold start
- **No ticket system** — Phan has to tell Ramez who tells Rafiq
- **No audit trail** — no history of what changed
- **50+ tasks from Phan meeting unimplemented** (feedback-tasks.md)
- **Vercel deployment** connected to unknown GitHub account — pushes from kabsam549-bot may not trigger auto-deploy. Need Ramez to check Vercel Git settings.
- **EQD2 calculator** partially done but missing Jack's specific planning directives
- **General pathway** (non-dosimetric) not built yet
- **Bleeding risk logic** not implemented
- **No anatomical diagrams**

### Repo Stats
- **7,155 lines** across 26 files
- **Main components**: MDACCPathway (1,202 LOC), SalvagePathway (893), page.tsx (629)
- **Libs**: oarConstraints, oarDoseBudget, rpaClassification, bedCalculations, calculations

---

## 11. Design Principles

1. **Phan edits content, Rafiq edits code.** Clear separation. Phan should never need to touch a JSON file, write CSS, or open a terminal. If he can't do it from /admin, it's a ticket.

2. **Clinical accuracy over feature breadth.** A calculator with 5 accurate features beats one with 20 broken ones. Every value in the tool should be defensible with a citation.

3. **60-second rule for referring physicians.** The general pathway must give a useful answer in under a minute. If it takes longer, the pathway is too complex.

4. **Mobile-first for the calculator, desktop-first for admin.** Surgeons check this in the OR on their phone. Phan edits at his desk.

5. **Audit everything.** Every content change, every ticket, every deploy. This is a clinical tool — traceability matters.

6. **Degrade gracefully.** If Vercel KV is down, fall back to hardcoded defaults. The calculator should never show a blank screen.

---

## 12. Build Plan

### Week 1: Admin Panel + Ticket System
**Builder: Codex / Opus**

Day 1-2:
- Set up Vercel KV project
- Create API routes: GET/PUT /api/content, GET /api/audit
- Migrate editableContent.ts defaults → KV seed
- Calculator reads from KV (with fallback to defaults)
- Admin panel saves to KV
- Audit log on every save

Day 2-3:
- Create Notion ticket database
- API routes: POST/GET /api/tickets
- Admin panel: ticket submission form
- Admin panel: ticket list with status badges
- Set up nightly cron (1 AM CST): query Notion for new tickets → alert Rafiq

### Week 2: Clinical Quick Wins (Phase 2)
**Builder: Codex / Opus**

- Back button, terminology fixes, info icons
- Disease-free interval, flap status, histology updates
- Volume threshold update to 4-tier

### Week 3-4: EQD2 + General Pathway (Phases 3-4)
**Builder: Codex / Opus**

- Full EQD2 calculator rebuild
- General pathway build
- Bleeding risk logic
- Anatomical diagram generation

### Ongoing: Phan Validation + Data Integration (Phase 5)
- Generate outcome combinations → send to Phan
- Integrate data as it becomes available
- Process tickets nightly

---

## 13. Nightly Ticket Processing — How It Works

```
Every night at 1:00 AM CST:

1. Query Notion: GET tickets WHERE status = "Submitted"
2. For each ticket:
   a. Assess complexity (content edit vs code change)
   b. If content edit only → Rafiq makes the KV change directly
   c. If code change → Codex builds it, Opus reviews, deploy
   d. Update ticket status → "Done"
   e. Add commit link + implementation notes
3. If no tickets → HEARTBEAT_OK, skip

Rafiq reports results to Ramez on Telegram in the morning.
```

This means Phan can submit a ticket at 3 PM, and by 7 AM the next morning it's live. For urgent fixes, Ramez can tell Rafiq to process immediately.
