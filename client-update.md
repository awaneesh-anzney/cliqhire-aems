# Client Lifecycle Guide — Lead se Sign tak (Complete Tracking + Frontend Mapping)

Ye doc `CLIENT_CRM_API.md` (jo pure endpoint reference hai) ka companion hai — yaha **poora lifecycle ek real journey ki tarah** dikhaya hai: client Lead banne se leke Sign hone tak, har step pe konsa API call hoga, uska req.body/response kya hoga, aur **frontend pe wo screen/component kaise banega**.

---

## Part 1 — Poora Lifecycle, Step-by-Step

### Step 0 — Client bana (Lead stage se shuru)

Ye existing endpoint hai (`POST /api/clients`), koi change nahi. Bas note karo: create hote hi `clientStage = 'Lead'` (default) set hota hai, `leadDate` pehli baar stage change pe automatically fill hota hai (ya migration se backfill).

---

### Step 1 — Lead stage me pehli activity log hoti hai (intro call)

Rep client ko call karta hai. Frontend "Log Activity" form submit karta hai:

**`POST /api/clients/665f.../activities`**
```json
{
  "activityType": "Call",
  "activityDate": "2026-07-01T09:00:00.000Z",
  "activityTime": "09:00",
  "attempts": 1,
  "discussionSummary": "Intro call — client ko requirement samjhaya",
  "outcome": "Client interested, pricing bhejni hai",
  "nextFollowUpDate": "2026-07-05T10:00:00.000Z",
  "nextFollowUpOwner": "665f...repId"
}
```

**Response — `201 Created`**
```json
{
  "success": true,
  "message": "Client activity logged successfully",
  "data": {
    "_id": "act_001",
    "stagePeriodId": "period_lead_001",
    "stageAtTime": "Lead",
    "activityType": "Call",
    "activityDate": "2026-07-01T09:00:00.000Z",
    "nextFollowUpDate": "2026-07-05T10:00:00.000Z",
    "nextFollowUpOwner": "665f...repId",
    "...": "..."
  }
}
```

`stagePeriodId`/`stageAtTime` automatically `Lead` set ho gaya (system ne khud kiya, frontend ko bhejna nahi padta). Client ka `nextFollowUpDate`/`nextFollowUpOwner` bhi automatically update ho gaya.

### Step 2 — Aur bhi activities (WhatsApp, email, demo meeting) — sab Lead ke andar hi group hongi

```json
{ "activityType": "Email", "discussionSummary": "Pricing PDF bheji", "attempts": 1 }
```
```json
{ "activityType": "Meeting", "isMeeting": true, "discussionSummary": "In-person demo", "outcome": "Client ne management se baat karne ko kaha" }
```

Ye sab `POST /activities` se, bas `activityType` badalta rehta hai. Sab `stagePeriodId = period_lead_001` se hi link honge — jab tak stage Lead hai.

### Step 3 — Follow-up due hone wala hai — reminder aata hai

Koi frontend action nahi lagta — background cron (`checkClientFollowUpDeadlines`, har 6 ghante) khud check karta hai. Jab `nextFollowUpDate` 24 ghante ke andar aata hai, `nextFollowUpOwner` (yaha wahi rep) ko ek in-app notification milti hai (existing notification bell/socket system se hi, koi naya UI nahi banana):

```json
{ "type": "CLIENT_FOLLOWUP_DUE", "title": "⏰ Follow-up Due Soon — ABC Pvt Ltd", "message": "Follow-up with \"ABC Pvt Ltd\" is due on 05 Jul 2026." }
```

### Step 4 — Client ne proposal accept kar liya → Stage change: Lead → Engaged

Frontend pe "Move to Engaged" button/dropdown se:

**`PATCH /api/clients/665f.../stage`**
```json
{
  "stage": "Engaged",
  "reason": "Proposal accept ho gaya",
  "closureSummary": "Lead stage me 3 touchpoints (call, email, demo meeting) hue"
}
```

**Response — `200 OK`**
```json
{
  "success": true,
  "message": "Client stage changed from 'Lead' to 'Engaged'.",
  "data": {
    "client": { "clientStage": "Engaged", "stageChangedAt": "2026-07-10T...", "leadDate": "2026-07-01T..." },
    "closedPeriod": { "_id": "period_lead_001", "stage": "Lead", "endedAt": "2026-07-10T...", "activityCount": 3 },
    "newPeriod": { "_id": "period_engaged_001", "stage": "Engaged", "startedAt": "2026-07-10T...", "endedAt": null }
  }
}
```

`period_lead_001` humesha ke liye "closed" ho gaya (3 activities ke saath). Ab se koi bhi nayi activity `period_engaged_001` se link hogi.

### Step 5 — Engaged stage me negotiation chalti hai (multiple rounds)

**Round 1:**
```json
{
  "activityType": "Negotiation",
  "discussionSummary": "Pricing discuss hui",
  "negotiationDetails": {
    "dealValue": 50000,
    "proposedTerms": "12-month retainer",
    "objections": "10% discount maang rahe hain",
    "negotiationStatus": "Ongoing"
  },
  "nextFollowUpDate": "2026-07-15T10:00:00.000Z"
}
```

**Round 2 (kuch din baad):**
```json
{
  "activityType": "Negotiation",
  "discussionSummary": "Discount pe consensus bana",
  "negotiationDetails": { "dealValue": 47000, "negotiationStatus": "Agreed" }
}
```

Dono `period_engaged_001` ke andar group ho jayengi. Jab `negotiationStatus` set ho, previous `nextFollowUpOwner` ko `CLIENT_NEGOTIATION_UPDATED` notification bhi jaati hai.

### Step 6 — Deal ho gaya → Stage change: Engaged → Signed

```json
{ "stage": "Signed", "reason": "Contract sign ho gaya", "closureSummary": "2 negotiation rounds, final value 47000 SAR" }
```

`period_engaged_001` close, `period_signed_001` open.

### Step 7 — Poora lifecycle ek jagah dekhna (dashboard/detail page ke liye)

**`GET /api/clients/665f.../timeline`**

```json
{
  "success": true,
  "data": [
    { "stage": "Signed", "startedAt": "2026-07-20T...", "endedAt": null, "activityCount": 0, "activities": [] },
    {
      "stage": "Engaged",
      "startedAt": "2026-07-10T...",
      "endedAt": "2026-07-20T...",
      "closureSummary": "2 negotiation rounds, final value 47000 SAR",
      "activityCount": 2,
      "activities": [ "...negotiation round 2...", "...negotiation round 1..." ]
    },
    {
      "stage": "Lead",
      "startedAt": "2026-07-01T...",
      "endedAt": "2026-07-10T...",
      "closureSummary": "Lead stage me 3 touchpoints hue",
      "activityCount": 3,
      "activities": [ "...meeting...", "...email...", "...call..." ]
    }
  ]
}
```

Ye ek hi response poori client-history de deta hai — Lead se Signed tak, har stage ke andar uski activities, kis stage me kitna time laga (`startedAt`→`endedAt`), aur negotiation ka poora trail.

---

## Part 2 — Frontend pe Kaise Map Karna Hai

### A) Client Detail Page — Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ABC Pvt Ltd            [Lead ▾]  Priority: 1   New Client   │  ← Header
│  Next Follow-up: 05 Jul 2026 (Ayesha Khan)      [Edit]        │  ← Follow-up widget
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Timeline] [Stage History] [Documents] [Contacts] │  ← Tabs
├─────────────────────────────────────────────────────────────┤
│   ... selected tab ka content ...                             │
└─────────────────────────────────────────────────────────────┘
```

| UI Element | Data Source | Notes |
|---|---|---|
| Header stage badge (`Lead ▾`) | `client.clientStage` (existing `GET /clients/:id`) | Dropdown click → confirm modal → `PATCH /:id/stage` |
| Priority / New-Existing tags | `client.clientPriority`, `client.clientType` (existing fields) | Read-only chips |
| Follow-up widget | `client.nextFollowUpDate`, `client.nextFollowUpOwner` | "Edit" button → date-picker + owner-dropdown modal → `PATCH /:id/follow-up` |
| Overdue highlight | Frontend compares `nextFollowUpDate < now` | Red badge/icon agar overdue |

### B) "Change Stage" Modal

Trigger: header ka stage-dropdown.

| Form Field | Input Type | Maps to |
|---|---|---|
| New Stage | Radio/Select (`Lead`/`Engaged`/`Signed`, current disabled) | `stage` |
| Reason | Text input (optional) | `reason` |
| Stage Summary (kya hua is stage me) | Textarea (optional, "closing this stage" hint) | `closureSummary` |

Submit → `PATCH /:id/stage` → response se `client` update karo (header refresh) + Timeline tab ko invalidate/refetch karo (naya period ban gaya hai).

### C) "Log Activity" Modal (sabse zyada use hoga)

| Form Field | Input Type | Maps to | Notes |
|---|---|---|---|
| Channel | Select: Call / WhatsApp / LinkedIn / Email / Meeting / Data Update / Negotiation / Proposal Sent | `activityType` | Required |
| Contact Person | Select (client ke `PrimaryContact` list se) | `contactId` | `GET /clients/:id/primary-contacts` se options |
| Client-facing or Internal | Toggle | `interactionScope` | Default: Client-facing |
| Date & Time | Date-picker + time-picker | `activityDate`, `activityTime` | Default: now |
| Attempts | Number stepper | `attempts` | Default: 1 |
| Meeting? | Checkbox | `isMeeting` | Auto-check agar Channel = Meeting |
| Discussion | Textarea | `discussionSummary` | |
| Outcome / Next Action | Textarea | `outcome` | |
| **— sirf jab Channel = Negotiation/Proposal Sent —** | | | Conditional section, form me dikhana/hide karna |
| Deal Value (SAR) | Number | `negotiationDetails.dealValue` | |
| Proposed Terms | Textarea | `negotiationDetails.proposedTerms` | |
| Objections | Textarea | `negotiationDetails.objections` | |
| Competitor Mentioned | Text | `negotiationDetails.competitorMentioned` | |
| Expected Closure | Date-picker | `negotiationDetails.expectedClosureDate` | |
| Negotiation Status | Select: Ongoing/Stuck/Agreed/Rejected | `negotiationDetails.negotiationStatus` | |
| **— optional footer —** | | | |
| Revenue (SAR) | Number | `revenue` | |
| Set Next Follow-up | Date-picker (optional) | `nextFollowUpDate` | Agar bhara, follow-up widget bhi turant update dikhao |
| Follow-up Owner | Select (rep/user list) | `nextFollowUpOwner` | Default: current logged-in user |

Submit → `POST /:id/activities` → response ki activity ko **Timeline tab ke top pe turant prepend** kar do (optimistic-ish update), aur agar `nextFollowUpDate` bheja tha to header ka follow-up widget bhi turant refresh karo.

### D) Timeline Tab (`GET /:id/timeline`) — Stage-wise Accordion

```
▾ Engaged  (10 Jul – ongoing)              2 activities
    🤝 Negotiation — 15 Jul — Agreed, ₹47,000
    🤝 Negotiation — 12 Jul — Ongoing, ₹50,000

▸ Lead  (01 Jul – 10 Jul)                  3 activities   [collapsed]
    "Lead stage me 3 touchpoints hue"   ← closureSummary, collapsed header ke neeche chhoti line me
```

- Har item `response.data` array ka ek object hai — **default sabse upar wala (current/active period) khula rahe**, baaki collapsed.
- Har period ke andar `activities` array ko cards/list-items me render karo — icon `activityType` ke hisaab se (📞 Call, 💬 WhatsApp, 🤝 Negotiation, etc.), `activityDate` format karke dikhao.
- Negotiation type ki activity ho to `negotiationDetails.dealValue` + `negotiationStatus` ko ek chhota badge ki tarah card pe dikha do (jaise upar example me).
- Empty `activities: []` wale period (abhi-abhi bana naya stage) ke liye "Koi activity abhi tak nahi" placeholder.

### E) Stage History Tab (`GET /:id/stage-history`) — halka version

Agar Timeline tab already sab kuch de raha hai (periods + activities), ye tab optional hai — sirf ek compact table jaisa view ho sakta hai:

| Stage | Start | End | Duration | Activities | Changed By |
|---|---|---|---|---|---|
| Engaged | 10 Jul | — (current) | 20 days | 2 | Ayesha Khan |
| Lead | 01 Jul | 10 Jul | 9 days | 3 | Ayesha Khan |

Ye "kis stage me kitna time laga" jaise reporting/funnel-analysis ke liye useful hai.

### F) List/Dashboard Page (saare clients ki list)

Existing `GET /clients` list endpoint me naye fields already aa rahe honge (`clientType`, `nextFollowUpDate`, `nextFollowUpOwner`, `lastContactedAt`) — table me naye columns/filters add kar sakte ho:

| Column | Field | UI treatment |
|---|---|---|
| Stage | `clientStage` | Colored badge (Lead=grey, Engaged=blue, Signed=green) |
| Next Follow-up | `nextFollowUpDate` | Red text agar overdue, orange agar aaj/kal me hai |
| Last Contacted | `lastContactedAt` | "3 din pehle" jaisa relative format |
| New/Existing | `clientType` | Small tag |

Filter bar me `Pipeline`/stage filter already tha, wahi reuse hoga.

### G) Notifications (frontend, existing system reuse)

Koi naya notification-UI nahi banana — existing bell/socket component me ye 4 naye types already aayenge (backend se), bas inke liye icon/label map kar dena:

| `type` | Suggested icon/label |
|---|---|
| `CLIENT_STAGE_CHANGED` | 📊 "Stage changed" |
| `CLIENT_ACTIVITY_LOGGED` | 📞 "New activity" |
| `CLIENT_NEGOTIATION_UPDATED` | 🤝 "Negotiation update" |
| `CLIENT_FOLLOWUP_DUE` / `CLIENT_FOLLOWUP_OVERDUE` | ⏰ / 🚨 "Follow-up due/overdue" |

Har notification me `actionUrl: /clients/:id` already aata hai (backend se) — click pe seedha us client ke detail page pe le jao, `relatedClient` field se client id bhi mil jayega agar chahiye.

### H) State/Data-fetching suggestion (React ke liye, generic)

- Client detail page load hote hi: `GET /clients/:id` (header ke liye) + `GET /clients/:id/timeline` (default tab) parallel fetch karo.
- "Log Activity" ya "Change Stage" submit ke baad: response me mile updated `client`/`activity` se local state turant update karo (optimistic feel ke liye), phir background me `timeline` ko revalidate/refetch kar do taaki `activityCount`/grouping sahi rahe.
- `Stage History` aur `Activities` (flat list, filter wala) tabs **lazy-load** karo — jab tak user unpe click na kare tab tak call mat karo.

---

## Quick Reference — Konsa UI Action, Konsa API

| Frontend Action | API Call |
|---|---|
| Client detail page open | `GET /clients/:id` |
| Timeline tab open | `GET /clients/:id/timeline` |
| Stage history tab open | `GET /clients/:id/stage-history` |
| "Log Activity" submit | `POST /clients/:id/activities` |
| Activities tab (filtered flat list) | `GET /clients/:id/activities?activityType=...&stage=...` |
| "Change Stage" submit | `PATCH /clients/:id/stage` |
| Follow-up widget "Edit" submit | `PATCH /clients/:id/follow-up` |

Poore field-level req.body/response ke liye `CLIENT_CRM_API.md` dekho — ye doc sirf flow aur UI-mapping ke liye hai.