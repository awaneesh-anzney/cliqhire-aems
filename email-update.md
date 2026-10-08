# Frontend Guide — Email Send / Reply / Reply-All

Ye document frontend team ke liye hai. Backend me jo changes hue hain (failed send, reply, reply-all) unke hisaab se frontend me kya karna hai, har endpoint ke `req.body` aur response examples ke saath.

Base URL: `https://aems-backend-v1.onrender.com/api/email`
Auth: har request me logged-in user ka token (jaise baaki APIs me bhej rahe ho).

---

## 0. Summary — frontend ko kya badalna hai

| # | Kya | Kyun |
|---|-----|------|
| 1 | Compose ka HTML `html` field me bhejo (`text` me nahi) | Pehle `text` me `<p>..</p>` jaa raha tha |
| 2 | Reply / Reply-All button par pehle **`GET /emails/:id/reply-info`** call karo, usse To/Cc/Subject prefill karo | Original me 2+ log hon to sabko jaana chahiye; ya user jise chahe |
| 3 | To / Cc / Bcc editable rakho (chips) — user kisi ko hata/jod sakta hai | Jo bhejoge wahi jaayega |
| 4 | Send fail (502) hone par **compose box band mat karo**, error dikhao, user dobara try kare | Ab fail hui mail DB me save nahi hoti, Sent me nahi dikhegi |
| 5 | Send button ko request ke dauran disable karo | Double click = double mail |
| 6 | Sender ka `fromName` khali ho to `fromEmail` dikhao | Kuch emails me naam hota hi nahi |

---

## 1. Reply / Reply-All — recipients kaise nikaalein

### `GET /api/email/emails/:id/reply-info?mode=reply|replyAll`

`:id` = **jis email ka reply kar rahe ho uska `_id`** (list / thread API se mila hua).
`mode` = `reply` (default) ya `replyAll`.

Backend ye rules lagata hai:

| Situation | `reply` | `replyAll` |
|-----------|---------|------------|
| Dusre ne bheji mail | sirf sender | sender + original ke saare **To** → `to`, original ke saare **Cc** → `cc` |
| Apni bheji (Sent) mail ka reply | jinko bheji thi wahi (`to`) | `to` + `cc` same |
| Khud ko bheji mail | khud ko | khud ko |

Dono me: **apna address hata diya jata hai**, **duplicates nahi aate**, subject me `Re: ` sirf tab judta hai jab pehle se na ho.

**Request:** koi body nahi.

```
GET /api/email/emails/6ac738c5649e8aede12c63cf/reply-info?mode=replyAll
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "mode": "replyAll",
    "inReplyTo": "6ac738c5649e8aede12c63cf",
    "threadId": "6ac737dbff2e8c12a7c2d93f",
    "subject": "Re: Plan",
    "to": [
      { "name": "Raj",   "email": "raj@x.com",   "address": "Raj <raj@x.com>" },
      { "name": "Priya", "email": "priya@x.com", "address": "Priya <priya@x.com>" }
    ],
    "cc": [
      { "name": "", "email": "boss@x.com", "address": "boss@x.com" }
    ],
    "bcc": [],
    "hasMultipleRecipients": true
  }
}
```

| Field | Matlab |
|-------|--------|
| `inReplyTo` | `/send` me yahi bhejna hai (email ka `_id`) |
| `threadId` | `/send` me yahi bhejna hai |
| `subject` | Subject field me prefill |
| `to`, `cc` | Chips me prefill. `address` wo string hai jo `/send` me bhejna hai |
| `hasMultipleRecipients` | `true` ho tabhi **Reply-All** button dikhao (warna Reply hi kaafi hai) |

**Errors:**

```json
{ "success": false, "message": "Invalid email id" }          // 400
{ "success": false, "message": "Email not found" }           // 404
{ "success": false, "message": "No mailbox connected for this account" }  // 404
```

### UI flow (recommended)

1. Email/thread dekhte waqt **Reply** button (hamesha) + **Reply All** button (sirf jab `hasMultipleRecipients` true). Ye flag pehle se pata nahi hota, isliye email kholte hi `reply-info?mode=replyAll` ek baar call karke flag le sakte ho, ya dono buttons hamesha dikhao.
2. Button click → `reply-info` call → compose box open karo, **To / Cc chips prefilled**.
3. User chips me se kisi ko **x** karke hata sakta hai, ya naya address type karke jod sakta hai. (Isi liye "jise chahe usi ko" wala requirement poora hota hai.)
4. Bcc ka alag field rakho (optional, khali start hota hai).
5. Send dabane par neeche wala `POST /send`.

---

## 2. Email bhejna

### `POST /api/email/send`

Content-Type: **`multipart/form-data`** (attachments ke liye). Attachments na ho tab bhi multipart bhej sakte ho.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `to` | string ya repeated field | ✅ | Ek ya zyada. Comma/semicolon se alag ya `to` field baar-baar |
| `cc` | string ya repeated field | ❌ | Same |
| `bcc` | string ya repeated field | ❌ | Same |
| `subject` | string | ✅ | |
| `html` | string | ❌* | **Compose ka HTML yahan bhejo** |
| `text` | string | ❌* | Sirf plain text ho tab. (*`html` ya `text` me se ek zaroori) |
| `threadId` | string | ❌ | Reply me `reply-info.threadId` |
| `inReplyTo` | string | ❌ | Reply me email ka `_id` (`reply-info.inReplyTo`) |
| `signatureId` | string | ❌ | Signature auto-append |
| `attachments` | file[] | ❌ | Max **5 files**, har file max **15 MB**. `.exe .bat .cmd .sh .msi .dll .scr` allowed nahi |

**Recipients bhejne ke 2 valid tareeke** (dono chalte hain):

```js
// A) Ek hi string, comma se alag (display name me comma ho to quotes lagao)
form.append('to', 'raj@x.com, Priya <priya@x.com>');

// B) Har address alag field (recommended — chips se seedha)
toChips.forEach(c => form.append('to', c.address));
ccChips.forEach(c => form.append('cc', c.address));
```

**Reply-All bhejne ka pura example (axios):**

```js
const info = (await api.get(`/email/emails/${emailId}/reply-info`, { params: { mode: 'replyAll' } })).data.data;

const form = new FormData();
toChips.forEach(c => form.append('to', c.address));   // user ne jo chips rakhe wahi
ccChips.forEach(c => form.append('cc', c.address));
bccChips.forEach(c => form.append('bcc', c.address));
form.append('subject', subject);
form.append('html', editorHtml);                       // ✅ html, text nahi
form.append('threadId', info.threadId);
form.append('inReplyTo', info.inReplyTo);
files.forEach(f => form.append('attachments', f));

try {
  setSending(true);
  const res = await api.post('/email/send', form);     // Content-Type axios khud lagata hai
  closeCompose();
  toast.success('Email sent');
  // res.data.data = saved email → Sent list/thread me add kar sakte ho
} catch (err) {
  // ❗ Compose box band MAT karo — user ka likha hua bacha rehna chahiye
  toast.error(err.response?.data?.error || err.response?.data?.message || 'Send failed');
} finally {
  setSending(false);
}
```

> ⚠️ `Content-Type` ko haath se `multipart/form-data` set mat karo (boundary chhoot jaata hai). Axios/fetch me FormData dene par browser khud sahi header lagata hai.

**Response 201 (sent):**

```json
{
  "success": true,
  "message": "Email sent",
  "data": {
    "_id": "6ac72d4ecf5bdce5e00ea1f2",
    "mailboxId": "6aba822818920ba9ea73ceed",
    "threadId": "6ac737dbff2e8c12a7c2d93f",
    "direction": "sent",
    "from": "akumar@fluxbridge360.com",
    "fromEmail": "akumar@fluxbridge360.com",
    "to": ["raj@x.com", "Priya <priya@x.com>"],
    "toRecipients": [
      { "name": "", "email": "raj@x.com" },
      { "name": "Priya", "email": "priya@x.com" }
    ],
    "cc": ["boss@x.com"],
    "subject": "Re: Plan",
    "bodyHtml": "<p>ok</p>",
    "attachments": [],
    "inReplyTo": "<CAF...@mail.gmail.com>",
    "folder": "sent",
    "status": "sent",
    "sentAt": "2026-10-08T05:42:38.909Z"
  }
}
```

**Response 502 (Outlook/mail server ne bhejne se mana kiya) — ab kuch save nahi hota:**

```json
{
  "success": false,
  "message": "Email was not sent. Please try again.",
  "error": "Graph access denied (403): ..."
}
```

> Pehle is response me `data` hota tha aur mail Sent me `failed` dikhti thi. **Ab `data` nahi aata, mail DB me save nahi hoti, Sent me nahi dikhegi.** Frontend ko bas error dikhana hai aur compose khula rakhna hai.

**Other errors:**

```json
// 400 — to/subject nahi diya
{ "success": false, "message": "Validation failed", "errors": [ { "msg": "to is required", "path": "to" } ] }

// 400 — attachment problem (bada / blocked type)
{ "success": false, "message": "File type .exe is not allowed as an email attachment" }

// 400 — mailbox connected nahi / reconnect chahiye
{ "success": false, "message": "Mailbox is disconnected — please reconnect via \"Sign in with Microsoft\" in Email Settings" }
```

### Retry / double-send ke baare me

- **502** aaye to mail **bheji nahi gayi** — safe hai dobara bhejna.
- **Network timeout / request beech me cut** ho jaaye (response hi na mile) to ho sakta hai mail chali gayi ho. Aise me turant dobara mat bhejo; pehle **Sent list** refresh karke dekho.
- Send button request ke dauran **disable** rakho.

---

## 3. Draft se bhejna

### `POST /api/email/drafts/:id/send`

**req.body** (optional):

```json
{ "signatureId": "6a9f0c1e2b3d4e5f6a7b8c9d" }
```

Response `/send` jaisa hi (201 ya 502). **Fail hone par draft delete nahi hota**, to user ka likha hua bacha rehta hai. Success par draft apne aap delete ho jata hai — frontend drafts list se hata de.

---

## 4. Lists me jo badla (frontend ko kuch karna nahi, bas pata hona chahiye)

- `GET /inbox`, `/sent`, `/trash`, `/archive`, `/important`, `/threads/:id`, `/search`, `/search/messages` — ab **failed sends return nahi hote** (purane bhi nahi).
- `GET /threads` (thread list) abhi bhi purane failed-only threads dikha sakta hai. Inhe hatane ke liye backend team `scripts/cleanup_failed_emails.js` ek baar chalaye. Uske baad kuch nahi dikhega.
- Email object me `status: "failed"` ab naye data me kabhi nahi aayega. Purane code me `status === 'failed'` ke liye jo "Failed / Retry" badge ya error text dikhate ho, wo hata sakte ho.

---

## 5. Chhote UI points

| Point | Kya karna hai |
|-------|---------------|
| Sender name | `fromName` khali ho to `fromEmail` dikhao. Kuch emails (jaise `roque@aems-sa.com`) me name hota hi nahi |
| Reply subject | `reply-info.subject` use karo, khud `Re:` mat jodo |
| Quoted original text | Backend original ka quoted text khud nahi jodta. Chaho to editor me original mail ka text (blockquote) khud prefill karo |
| Bade mailbox ka pehla sync | Jab tak first sync chal raha ho, naye mails ka live socket event nahi aata. Inbox ko page refresh/pull-to-refresh se reload karo. Sync khatam hone ke baad live aate hain |
| Attachment limit | Frontend me 5 files / 15 MB per file pehle hi check kar lo |

---

## 6. Test checklist

- [ ] Ek aisi mail kholo jisme 3 log hain → **Reply** sirf sender ko, **Reply All** me sab (apna address nahi)
- [ ] Reply-All me ek chip hata ke bhejo → wo banda mail nahi pata
- [ ] Naya address Cc me jodke bhejo → usko mail jaati hai
- [ ] Wahi reply 2-3 baar karo (same thread) → har baar chalta hai, error nahi
- [ ] Gmail me check karo: reply original ke thread me dikhti hai
- [ ] Send fail simulate karo (internet/permission) → error toast, compose khula, **Sent list me kuch naya nahi**
- [ ] Draft se send fail ho → draft bacha rehta hai
- [ ] Attachment ke saath reply bhejo (2 files)