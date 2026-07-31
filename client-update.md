# Client CRM — New API Reference

Ye doc sirf **naye 6 CRM endpoints** ke liye hai jo is upgrade me add hue hain. Purane client endpoints (`POST /clients`, `GET /clients`, `PATCH /clients/:id`, etc.) bilkul waise hi hain, unme koi change nahi.

Base path: `/api/clients` (jo bhi tumhara `API_PREFIX` hai)

Sab routes `Authorization: Bearer <token>` header maangte hain (`authenticate` middleware) + relevant permission (`clients.view` ya `clients.edit`) — same pattern jo baaki client routes me hai.

---

## Kya naya bana (quick recap)

| File | Kya hai |
|---|---|
| `src/models/clientStageHistoryModel.js` | Stage-period tracking (Lead/Engaged/Signed, start-end dates) |
| `src/models/clientActivityModel.js` | Call/WhatsApp/LinkedIn/Email/Meeting/Negotiation log |
| `src/controllers/client/clientStageController.js` | Stage change + stage-history |
| `src/controllers/client/clientActivityController.js` | Activity log + stage-wise timeline |
| `src/controllers/client/clientFollowUpController.js` | Manual follow-up update |
| `src/services/cronService.js` → `checkClientFollowUpDeadlines()` | Har 6 ghante follow-up due/overdue check karta hai |

`Client` model me naye fields: `clientType`, `leadDate`, `stageChangedAt`, `nextFollowUpDate`, `nextFollowUpOwner`, `lastContactedAt` (+ internal reminder-guard fields). `clientRm` jaisa purana field bilkul waisa hi hai (String, ObjectId nahi banaya — taaki kahin kuch na toote).

---

## 1. `PATCH /api/clients/:id/stage`

Client ka stage change karta hai (Lead → Engaged → Signed, ya koi bhi combination) — purane open stage-period ko close karke naya period start karta hai.

**Permission:** `clients.edit`

### Request body
```json
{
  "stage": "Engaged",
  "reason": "Client ne proposal accept kiya",
  "closureSummary": "Lead stage me 3 calls hue, pricing discuss hui"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `stage` | String | ✅ | `Lead` \| `Engaged` \| `Signed` |
| `reason` | String | ❌ | Naye stage-period ke saath save hota hai |
| `closureSummary` | String | ❌ | **Band ho rahe (purane) period** me save hota hai — "us stage me overall kya hua" |

### Success response — `200 OK`
```json
{
  "success": true,
  "message": "Client stage changed from 'Lead' to 'Engaged'.",
  "data": {
    "client": { "...": "poora updated client object, clientStage/stageChangedAt updated" },
    "closedPeriod": { "_id": "...", "stage": "Lead", "startedAt": "...", "endedAt": "2026-07-30T..." },
    "newPeriod": { "_id": "...", "stage": "Engaged", "startedAt": "2026-07-30T...", "endedAt": null }
  }
}
```

### No-change response — `200 OK`
Agar client already usi stage me hai:
```json
{ "success": true, "message": "No change detected; client is already in this stage.", "data": { "...client..." } }
```

### Error responses
- `400` — invalid client ID, ya `stage` missing/invalid enum
- `404` — client not found
- `500` — server error (`error` field me message)

**Notification:** Agar client ka `nextFollowUpOwner` set hai, to usi ek user ko `CLIENT_STAGE_CHANGED` notification jaata hai (poori team ko broadcast nahi).

---

## 2. `GET /api/clients/:id/stage-history`

Client ke saare stage-periods (Lead/Engaged/Signed cycles) — naye se purane order me.

**Permission:** `clients.view`

### Response — `200 OK`
```json
{
  "success": true,
  "message": "Client stage history fetched successfully",
  "count": 2,
  "data": [
    {
      "_id": "...",
      "client_id": "...",
      "stage": "Engaged",
      "startedAt": "2026-07-30T10:00:00.000Z",
      "endedAt": null,
      "changedBy": { "_id": "...", "firstName": "Ayesha", "lastName": "Khan", "email": "..." },
      "reason": "Client ne proposal accept kiya",
      "closureSummary": "",
      "activityCount": 2
    },
    {
      "_id": "...",
      "stage": "Lead",
      "startedAt": "2026-07-01T09:00:00.000Z",
      "endedAt": "2026-07-30T10:00:00.000Z",
      "closureSummary": "Lead stage me 3 calls hue, pricing discuss hui",
      "activityCount": 3
    }
  ]
}
```

---

## 3. `POST /api/clients/:id/activities`

Ek call/WhatsApp/LinkedIn/email/meeting/negotiation log karta hai. Har call ek naya row hai — kitni bhi log ki ja sakti hain, koi limit nahi.

**Permission:** `clients.edit`

### Request body
```json
{
  "contactId": "665f1b2c3a4d5e6f7a8b9c0d",
  "repId": "665f1b2c3a4d5e6f7a8b9c0e",
  "interactionScope": "Client-facing",
  "activityType": "Negotiation",
  "activityDate": "2026-07-30T14:00:00.000Z",
  "activityTime": "14:00",
  "attempts": 1,
  "isMeeting": false,
  "discussionSummary": "Pricing pe negotiation hui, client 10% discount maang raha hai",
  "outcome": "Follow-up call agle hafte",
  "negotiationDetails": {
    "dealValue": 50000,
    "proposedTerms": "12-month retainer",
    "objections": "Pricing thodi high lag rahi hai",
    "competitorMentioned": "XYZ Consulting",
    "expectedClosureDate": "2026-08-15",
    "negotiationStatus": "Ongoing"
  },
  "revenue": null,
  "nextFollowUpDate": "2026-08-06T10:00:00.000Z",
  "nextFollowUpOwner": "665f1b2c3a4d5e6f7a8b9c0e"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `contactId` | ObjectId | ❌ | `PrimaryContact._id` — client ki taraf se kaun mila |
| `repId` | ObjectId | ❌ | Default: logged-in user. **Ye field hi track karta hai ki kaunsa system-user is contact se baat kar raha hai** |
| `interactionScope` | String | ❌ | `Client-facing` (default) \| `Internal` |
| `activityType` | String | ✅ | `Call` \| `WhatsApp` \| `LinkedIn` \| `Email` \| `Meeting` \| `Data Update` \| `Negotiation` \| `Proposal Sent` |
| `activityDate` | Date | ❌ | Default: now |
| `activityTime` | String | ❌ | Free-text time, e.g. `"14:00"` |
| `attempts` | Number | ❌ | Default: 1 |
| `isMeeting` | Boolean | ❌ | Default: auto-true agar `activityType = Meeting` |
| `discussionSummary` | String | ❌ | Kya baat hui |
| `outcome` | String | ❌ | Result/decision |
| `negotiationDetails` | Object | ❌ | Sirf `Negotiation`/`Proposal Sent` ke liye meaningful — `dealValue`, `proposedTerms`, `objections`, `competitorMentioned`, `expectedClosureDate`, `negotiationStatus` (`Ongoing`\|`Stuck`\|`Agreed`\|`Rejected`) |
| `revenue` | Number | ❌ | SAR me |
| `nextFollowUpDate` | Date | ❌ | Diya jaaye to `Client.nextFollowUpDate` bhi update hoga |
| `nextFollowUpOwner` | ObjectId | ❌ | Diya jaaye to `Client.nextFollowUpOwner` bhi update hoga |

**Auto-fill (bina bheje bhi ho jata hai):** `stagePeriodId` aur `stageAtTime` — system khud current active stage-period se link kar deta hai, tumhe kuch bhejna nahi hai.

### Success response — `201 Created`
```json
{
  "success": true,
  "message": "Client activity logged successfully",
  "data": {
    "_id": "...",
    "client_id": "...",
    "stagePeriodId": "...",
    "stageAtTime": "Engaged",
    "contactId": "...",
    "repId": "...",
    "interactionScope": "Client-facing",
    "activityType": "Negotiation",
    "activityDate": "2026-07-30T14:00:00.000Z",
    "activityTime": "14:00",
    "attempts": 1,
    "isMeeting": false,
    "discussionSummary": "Pricing pe negotiation hui...",
    "outcome": "Follow-up call agle hafte",
    "negotiationDetails": { "dealValue": 50000, "negotiationStatus": "Ongoing", "...": "..." },
    "revenue": null,
    "nextFollowUpDate": "2026-08-06T10:00:00.000Z",
    "nextFollowUpOwner": "665f1b2c3a4d5e6f7a8b9c0e",
    "createdBy": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Error responses
- `400` — invalid client ID, missing/invalid `activityType`, ya `repId` resolve nahi ho paaya
- `404` — client not found
- `500` — server error

**Notification:** Agar activity save hone se pehle client ka koi `nextFollowUpOwner` tha (aur wo khud activity log karne wala rep nahi hai), to usko `CLIENT_ACTIVITY_LOGGED` jaata hai. Agar `activityType` Negotiation/Proposal Sent hai aur `negotiationStatus` diya hai, to `CLIENT_NEGOTIATION_UPDATED` bhi jaata hai — dono sirf usi ek owner ko, broadcast nahi.

---

## 4. `GET /api/clients/:id/activities`

Client ki activities list — filter/paginate ke saath.

**Permission:** `clients.view`

### Query params (sab optional)
| Param | Notes |
|---|---|
| `activityType` | e.g. `?activityType=Negotiation` |
| `stage` | e.g. `?stage=Lead` (filters by `stageAtTime`) |
| `repId` | Kisi specific rep ki activities |
| `page` | Default 1 |
| `limit` | Default 20 |

### Response — `200 OK`
```json
{
  "success": true,
  "message": "Client activities fetched successfully",
  "count": 20,
  "total": 47,
  "page": 1,
  "totalPages": 3,
  "data": [ /* array of ClientActivity docs, contactId/repId/createdBy populated with names */ ]
}
```

---

## 5. `GET /api/clients/:id/timeline`

**Stage-wise grouped view** — har stage-period ke andar uski activities. Isi endpoint se UI pe "Lead ke under ye sab hua, Engaged ke under ye sab hua" dikhega.

**Permission:** `clients.view`

### Response — `200 OK`
```json
{
  "success": true,
  "message": "Client timeline fetched successfully",
  "data": [
    {
      "_id": "period_engaged_id",
      "stage": "Engaged",
      "startedAt": "2026-07-30T10:00:00.000Z",
      "endedAt": null,
      "changedBy": { "firstName": "Ayesha", "lastName": "Khan" },
      "activityCount": 2,
      "activities": [
        { "activityType": "Negotiation", "activityDate": "2026-07-30T14:00:00.000Z", "...": "..." },
        { "activityType": "Call", "activityDate": "2026-07-30T09:00:00.000Z", "...": "..." }
      ]
    },
    {
      "_id": "period_lead_id",
      "stage": "Lead",
      "startedAt": "2026-07-01T09:00:00.000Z",
      "endedAt": "2026-07-30T10:00:00.000Z",
      "closureSummary": "Lead stage me 3 calls hue, pricing discuss hui",
      "activityCount": 3,
      "activities": [ "... 3 activity objects ..." ]
    }
  ]
}
```

Naya period (jismein abhi activities na hui ho) empty `activities: []` array ke saath aayega — array hamesha present rahega.

---

## 6. `PATCH /api/clients/:id/follow-up`

Sirf follow-up date/owner update karna ho (bina koi activity log kiye) — jaise rep ne phone pe hi date reschedule kar li.

**Permission:** `clients.edit`

### Request body (dono optional, kam se kam ek zaroor)
```json
{
  "nextFollowUpDate": "2026-08-10T10:00:00.000Z",
  "nextFollowUpOwner": "665f1b2c3a4d5e6f7a8b9c0e"
}
```

### Success response — `200 OK`
```json
{
  "success": true,
  "message": "Client follow-up updated successfully",
  "data": { "...": "poora updated client object" }
}
```

### Error responses
- `400` — dono fields missing, ya `nextFollowUpOwner` invalid ObjectId
- `404` — client not found
- `500` — server error

---

## Follow-up Reminder Cron

`checkClientFollowUpDeadlines()` — har 6 ghante chalta hai (`0 */6 * * *`, Asia/Kolkata):

- **Due soon** (`nextFollowUpDate` 24 ghante ke andar): ek baar `CLIENT_FOLLOWUP_DUE` notification `nextFollowUpOwner` ko
- **Overdue**: turant `CLIENT_FOLLOWUP_OVERDUE`, phir har 12 ghante me repeat — jab tak koi nayi activity log na ho ya follow-up manually update na ho (dono cases me guard reset ho jata hai, fresh reminder cycle shuru hoti hai)
- Recipient hamesha sirf `Client.nextFollowUpOwner` — koi broadcast nahi. **Note:** agar kisi client ka `nextFollowUpOwner` set hi nahi hai, cron use skip kar dega — is liye Section 6 (`/follow-up`) ya Section 3 (`/activities`) se ye field set karna zaroori hai.

---

## Purane behavior me kya kya waisa hi rakha gaya

- `PATCH /api/clients/:id` (generic update) aur `PATCH /api/clients/:id` → single-field wala `updateClientField` — dono bilkul waise hi kaam karte hain jaise pehle karte the, apne existing (aur kahin-kahin buggy — jaise `stage` vs `clientStage` field-name mismatch) logic ke saath. Naye stage endpoint (#1) inko replace nahi karte, sirf ek proper additional tarika hain.
- `clientRm` field type nahi badla (ab bhi plain String) kyunki `adminExportController.js` jaisi jagah is per depend karti hai — isko todne se Excel export toot jata.
- `Note` model bhi waisa hi hai — quick text comments ke liye, `ClientActivity` structured records ke liye.