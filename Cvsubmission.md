# CV Submission Responsibility — Frontend Integration Guide

Yeh doc do cheezon ka seedha jawab deta hai, phir har API ka poora reference:

1. **"Assigned kisko hai, iska GET hai ki nahi?"** → **Haan hai**, 3 alag GET endpoints se milta hai (neeche #1, #2, #3) — har situation ke liye alag.
2. **"Todo me Complete dalne ke baad CV submit kyun nahi ho raha?"** → **Root cause + exact fix neeche "⚠️ Sabse Zaroori Cheez" section me hai.** Yeh sabse pehle padhna.

---

## ⚠️ Sabse Zaroori Cheez — Todo "Complete" vs CV "Submit" alag cheezein hain

### Root cause

Tumhare app me **do alag systems** hain:

| System | Endpoint | Kya karta hai |
|---|---|---|
| **Generic "My Tasks" / To-Do** | `PATCH /api/tasks/reminders/:taskId` | Sirf ek **Task subdocument** ka `status` field update karta hai (`to-do → completed`). Yeh sirf UI checklist hai. |
| **CV Submission Responsibility** (naya feature) | `POST /api/cv-submission/:id/submit` | **Asli tracking record** (`CvSubmissionResponsibility`) ko `SUBMITTED` mark karta hai — 24h SLA, `isLate`, notifications, sab isi se control hota hai. |

**Yeh dono ek dusre se independent hain.** Agar frontend sirf generic To-Do wale "Complete" button se `PATCH /api/tasks/reminders/:taskId` call karta hai, to:
- To-Do list me item "completed" dikh jayega ✅ (UI me theek lagega)
- Lekin `CvSubmissionResponsibility` record **PENDING/OVERDUE hi rahega** ❌
- Cron ab bhi reminders bhejta rahega, overdue alert aayega, summary/report me "not submitted" hi dikhega

**Yehi tumhara "submit nahi ho raha" wala issue hai.**

### Fix — Frontend ko yeh karna hoga

CV-submission wale to-do item ko **generic to-do items se alag treat karna hoga**, aur uske "Complete" button ko **naye specific endpoint** par point karna hoga, generic wale par nahi.

**Kaise pehchanein ki koi to-do item CV-submission wala hai?**
Reminder Task object me `id` field hota hai — CV-submission wale tasks ka `id` hamesha is pattern se start hota hai:
```
cvsubmit_{candidateId}_{jobId}
```
(Waise hi jaise probation-reminder wale tasks `probation_{candidateId}_{jobId}` se start hote hain — yeh existing convention hai.)

```js
// GET /api/tasks/my-tasks se mile hue reminderTasks[] par:
const isCvSubmissionTask = (task) => task.id?.startsWith('cvsubmit_');
```

Task object me `candidateId` aur `jobId` already fields ki tarah maujood hain (dono system same schema share karte hain), isliye frontend ko extra parsing nahi karni — seedha `task.candidateId` aur `task.jobId` use karo.

**Recommended flow jab user CV-submission wale to-do par "Complete" click kare:**

```
1. task.id.startsWith('cvsubmit_') ? 
     → HAAN: 
        a. GET /api/cv-submission/candidate/:candidateId/job/:jobId/current
           (candidateId, jobId task object se hi milenge)
        b. Response se `_id` (responsibilityId) aur `status` nikaalo
        c. Agar status === 'OVERDUE' → "Reason" modal dikhao
             → POST /api/cv-submission/:id/reason  { reason }
           Warna (PENDING) → "Confirm CV Sent" modal dikhao
             → POST /api/cv-submission/:id/submit  { cvSubmissionDate? }
        d. Dono endpoints apne aap:
             - CvSubmissionResponsibility ko update karte hain
             - To-Do ko khud completed/refresh kar dete hain (backend se)
           → Isliye Step (d) ke baad PATCH /api/tasks/reminders/:taskId
             ALAG SE CALL KARNE KI ZAROORAT NAHI — backend already sync
             kar deta hai.
     → NAHI (normal to-do): 
        → Purana generic PATCH /api/tasks/reminders/:taskId hi chalega, kuch nahi badla
```

> **Important:** `/submit` aur `/reason` endpoints call karne ke baad tumhe **generic task-complete endpoint alag se call nahi karna** — backend khud us specific to-do ko complete/refresh kar deta hai (`taskService.updateReminderTaskStatus`/`createOrRefreshReminderTask` internally call hote hain). Agar tum dono call karoge to koi harm nahi (idempotent hai), bas zaroori nahi hai.

---

## 1. "Kisko assign hai" — GET APIs (3 variants, use-case ke hisaab se)

### 1a. Candidate ka pura pipeline card khol rahe ho, sirf "abhi kisko assign hai + status" chahiye
```
GET /api/cv-submission/candidate/:candidateId/job/:jobId/current
```
- Sabse **recommended** endpoint UI badge/card ke liye.
- Agar active (PENDING/OVERDUE) record hai → wahi milega.
- Agar koi active nahi (sab submit ho chuka) → sabse latest SUBMITTED record milega.
- Kabhi bhi active na bana ho → `data: null`.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "665f2000aaaa11112222bbbb",
    "status": "PENDING",
    "assignedTo": { "_id": "665f...c22", "name": "Priya Sharma", "email": "priya@company.com" },
    "assignedBy": { "_id": "665f...c99", "name": "Rahul Verma" },
    "dueAt": "2026-07-17T09:00:00.000Z",
    "isOverdueNow": false,
    "hoursRemaining": 18.4
  }
}
```
`assignedTo` yehi field hai jo batata hai **"kisko assign hai"** — naam aur email dono ke saath.

### 1b. Ek to-do item click karne par (task.id se candidateId/jobId already mil chuke hain)
Same endpoint (#1a) use karo — yeh flow "⚠️ Sabse Zaroori Cheez" section me already cover ho chuka hai.

### 1c. Notification se deep-link karna ho (`metadata.responsibilityId` already mila hua hai)
```
GET /api/cv-submission/:id
```
Seedha `_id` se record + `assignedTo` populated milega — extra candidateId/jobId lookup ki zaroorat nahi.

### 1d. Poori history/timeline dikhani ho (kitni baar reopen/reassign hua, sab reasons)
```
GET /api/cv-submission/candidate/:candidateId/job/:jobId
```
Array milega (saare cycles — agar candidate dobara Screening me aaya to purane bhi). `[0]` = sabse latest.

---

## 2. Complete API Reference

**Base URL:** `/api/cv-submission`
**Auth:** Sab routes `Authorization: Bearer <token>` maangte hain.
**Permission:** Saare routes `pipeline:view` maangte hain; write actions (`assign`, `reason`, `reassign`, `submit`) additionally `pipeline:edit` maangte hain.

### Route Table

| Method | Path | Kaam |
|---|---|---|
| `POST` | `/assign` | Kisi ko (khud ko/kisi aur ko) responsibility do — 24h clock start |
| `POST` | `/:id/reason` | Overdue task ke liye reason do → reopen, fresh 24h |
| `POST` | `/:id/reassign` | Kisi aur job-team member ko reassign karo |
| `POST` | `/:id/submit` | CV client ko bhej di — mark submitted |
| `GET` | `/my-tasks` | Apni saari active (PENDING/OVERDUE) responsibilities |
| `GET` | `/job/:jobId/summary` | Ek job ka summary (on-time %, overdue count, reasons) |
| `GET` | `/summary?recruiterId=&jobId=&from=&to=` | Org-wide/filtered summary (reporting dashboard) |
| `GET` | `/candidate/:candidateId/job/:jobId/current` | **Sirf ek current record** — assign kisko hai, status kya hai |
| `GET` | `/candidate/:candidateId/job/:jobId` | **Poori history/timeline** (saare cycles) |
| `GET` | `/:id` | Ek specific record (id se seedha) |

---

### 2.1 `POST /assign`

**Body:**
```json
{
  "pipelineId": "665f1a2b3c4d5e6f7a8b9c00",
  "candidateId": "665f1a2b3c4d5e6f7a8b9c11",
  "assignedTo": "665f1a2b3c4d5e6f7a8b9c22"
}
```
`assignedTo` = wo user jo responsible banega (khud ko ya kisi bhi job-team member ko select kar sakte ho — dropdown me `job.jobTeamMembers` ke saare users dikhao).

**Response `201`:**
```json
{
  "success": true,
  "message": "CV submission responsibility assigned. 24-hour deadline started.",
  "data": {
    "_id": "665f2000...",
    "status": "PENDING",
    "assignedTo": "665f1a2b3c4d5e6f7a8b9c22",
    "assignedBy": "665f1a2b3c4d5e6f7a8b9c99",
    "assignedAt": "2026-07-16T09:00:00.000Z",
    "dueAt": "2026-07-17T09:00:00.000Z",
    "history": [{ "event": "ASSIGNED", "by": "...", "to": "...", "at": "..." }]
  }
}
```

**Errors:** `400` (missing fields / user not on job team) · `404` (pipeline/candidate/job not found) · `409` (already assigned — use reassign)

---

### 2.2 `POST /:id/reason`

Sirf `OVERDUE` status wale task par chalega, aur **sirf currently-assigned person** hi call kar sakta hai.

**Body:**
```json
{ "reason": "Client panel unavailable to confirm required experience." }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Reason logged. Task reopened with a new 24-hour deadline.",
  "data": {
    "_id": "665f2000...",
    "status": "PENDING",
    "dueAt": "2026-07-18T10:15:00.000Z",
    "reopenCount": 1
  }
}
```

**Errors:** `400` (reason missing / status not OVERDUE) · `403` (caller assigned person nahi hai) · `404`

---

### 2.3 `POST /:id/reassign`

Koi bhi job-team member call kar sakta hai (khud ki responsibility nahi honi chahiye zaroori nahi).

**Body:**
```json
{ "newAssignedTo": "665f1a2b3c4d5e6f7a8b9c33", "reason": "Original assignee on leave" }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "CV submission responsibility reassigned. New 24-hour deadline started.",
  "data": { "_id": "665f2000...", "assignedTo": "665f1a2b3c4d5e6f7a8b9c33", "status": "PENDING", "dueAt": "2026-07-18T11:00:00.000Z", "reassignCount": 1 }
}
```

**Errors:** `400` (invalid/not-on-team user, ya already SUBMITTED) · `403` (caller khud job-team ka member nahi) · `404`

---

### 2.4 `POST /:id/submit`  ← **CV actually client ko bhej di gayi ho to yeh call karo**

**Body (optional):**
```json
{ "cvSubmissionDate": "2026-07-16T08:30:00.000Z" }
```
(Field omit karo to "abhi" (server time) use ho jayega.)

**Response `200`:**
```json
{
  "success": true,
  "message": "CV submission marked as completed.",
  "data": { "_id": "665f2000...", "status": "SUBMITTED", "submittedAt": "...", "cvSubmissionDate": "...", "isLate": false }
}
```

Isse **automatically**:
- To-do complete ho jaata hai (`taskService.updateReminderTaskStatus`)
- Saare job-team members ko "✅ CV Submitted" notification jaata hai (`isLate` flag ke saath)

---

### 2.5 `GET /my-tasks`
Login user ki saari active responsibilities. Frontend ke apne "My CV Submissions" widget ke liye.
```json
{ "success": true, "data": [ { "_id": "...", "status": "OVERDUE", "dueAt": "...", "job": { "jobTitle": "..." }, "candidate": { "name": "..." } } ] }
```

### 2.6 `GET /job/:jobId/summary` aur `GET /summary`
Reporting/dashboard ke liye — `totalAssigned`, `onTimePercentage`, `currentlyOverdue`, `delayReasons[]` etc. (Poori shape pichli MD file — `CV_SUBMISSION_RESPONSIBILITY_API.md` — section 7/8 me hai.)

---

## 3. Pura Lifecycle Example (ek candidate ke liye, timeline)

```
09:00  POST /assign  {assignedTo: Priya}          → status: PENDING, due: kal 09:00
       ↳ Priya ko notification + To-Do mila (id: cvsubmit_C123_J456)

21:00  (12h reminder)  cron notification bheja     → status: PENDING (koi change nahi)

kal
05:00  (4h reminder)   cron notification bheja
08:00  (1h reminder)   cron notification bheja

kal
09:00  (deadline cross) cron ne status OVERDUE kiya → Priya + poori job-team ko alert

kal
09:20  Priya "Complete" click karti hai to-do par
       → Frontend: task.id "cvsubmit_" se start hota hai → alag flow trigger
       → GET .../current → status OVERDUE mila
       → "Reason" modal dikhaya
       → POST /:id/reason { reason: "Client unavailable" }
       → status wapas PENDING, naya due: parso 09:20
       → To-Do khud-ba-khud refresh ho gaya (naya deadline text ke saath)

parso
08:00  Priya CV bhej deti hai client ko, wapas aa kar "Mark Sent" dabati hai
       → POST /:id/submit
       → status: SUBMITTED, isLate: false (deadline se pehle)
       → To-Do complete, poori team ko "✅ CV Submitted On Time" notification
```

---

## 4. Quick Frontend Checklist

- [ ] To-Do list render karte waqt har item ka `id` check karo — `cvsubmit_` prefix wale ko special treat karo (icon/badge "CV Submission" dikhao, generic to-do se visually alag).
- [ ] In items ke "Complete" button ko generic `PATCH /api/tasks/reminders/:taskId` **NAHI**, balki upar wale flow (`GET .../current` → `submit` ya `reason`) se wire karo.
- [ ] Candidate pipeline card/detail view me `GET .../current` call karke "Assigned to: {name}", "Due in: {hoursRemaining}h" ya "Overdue — reason pending" badge dikhao.
- [ ] "Assign CV Responsibility" button/dropdown — job ke `jobTeamMembers` list se koi bhi select karke `POST /assign` call karo.
- [ ] Overdue hone par ek "Reassign" option bhi dikhao (`POST /:id/reassign`) — koi bhi job-team member use kar sake.
- [ ] Reporting/Dashboard screen me `GET /job/:jobId/summary` aur `GET /summary` se on-time%, overdue count, aur `delayReasons[]` table banao.

---

## 5. Naye/Updated Files (is round me)

| File | Change |
|---|---|
| `src/services/cvSubmissionService.js` | `getCurrentForCandidate()` aur `getById()` methods add kiye |
| `src/controllers/cvSubmissionController.js` | `getCurrentForCandidate`, `getById` controllers add kiye; `submit` ko `service.getById()` use karne ke liye clean kiya |
| `src/routes/cvSubmissionRoutes.js` | `GET /candidate/:candidateId/job/:jobId/current` aur `GET /:id` routes add kiye (specific routes `/:id` se pehle rakhe gaye — Express route-order zaroori hai) |

Koi breaking change nahi — sab purane endpoints (`assign`, `reason`, `reassign`, `submit`, `my-tasks`, `summary`, history) waise hi hain jaise pehli MD file (`CV_SUBMISSION_RESPONSIBILITY_API.md`) me the.