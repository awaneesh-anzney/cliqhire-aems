@contextScopeItemMention @contextScopeItemMention @contextScopeItemMention @contextScopeItemMention @contextScopeItemMention @contextScopeItemMention # Role & Permission API — Complete Guide

---

## System ka Flow (Seedha samjho)

```
1. Admin register karta hai (ek baar)
         ↓
2. Admin roles banata hai  →  POST /api/roles
         ↓
3. Har role mein permissions set karta hai  →  PATCH /api/roles/:id/permissions
         ↓
4. Admin users add karta hai + roleId pass karta hai  →  POST /api/users/add-member
         ↓
5. User login karta hai  →  POST /api/auth/login
         ↓
6. Frontend permissions fetch karta hai  →  GET /api/roles/my-permissions
         ↓
7. Kabhi role badalna ho  →  PUT /api/roles/:roleId/assign/:userId
```

---

## Base URL
```
/api/roles
```

## Authentication
Har request mein header mein access token bhejno:
```
Authorization: Bearer <accessToken>
```

---

---

## API 1 — Saare Roles List karo

```
GET /api/roles
```

**Access:** ADMIN only  
**Permissions response mein NAHI aatein** — sirf naam, description, userCount

### Query Parameters (sab optional)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Per page items (max 100) |
| `search` | string | — | Role naam mein search (case-insensitive) |
| `isSystem` | boolean string | — | `"true"` sirf system roles, `"false"` sirf custom roles |

### Request Example
```
GET /api/roles?page=1&limit=10&search=recruiter&isSystem=false
Authorization: Bearer <adminToken>
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "64abc123...",
      "name": "Senior Recruiter",
      "description": "Experienced recruiter with extra access",
      "isSystem": false,
      "userCount": 3,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "64abc456...",
      "name": "BD Executive",
      "description": "Business development team",
      "isSystem": false,
      "userCount": 1,
      "createdAt": "2024-01-16T09:00:00.000Z",
      "updatedAt": "2024-01-16T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

> **Note:** `permissions` field is response mein **bilkul nahi aata**. 
> Permissions ke liye `GET /api/roles/:id` call karo.

---

## API 2 — Ek Role ki Detail (Permissions ke saath)

```
GET /api/roles/:id
```

**Access:** ADMIN only  
**Permissions yahan AATE HAIN** — full module-wise breakdown

### Request Example
```
GET /api/roles/64abc123...
Authorization: Bearer <adminToken>
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "64abc123...",
    "name": "Senior Recruiter",
    "description": "Experienced recruiter",
    "isSystem": false,
    "userCount": 3,
    "permissions": {
      "jobs": {
        "view": true,
        "create": true,
        "edit": true,
        "delete": false
      },
      "candidates": {
        "view": true,
        "create": true,
        "edit": true,
        "delete": false
      },
      "interviews": {
        "view": true,
        "create": true,
        "edit": false,
        "delete": false
      }
    },
    "createdBy": "64xyz789...",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## API 3 — Naya Role Banao

```
POST /api/roles
```

**Access:** ADMIN only

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ YES | Role ka naam (unique) — koi bhi naam de sakte ho |
| `description` | string | ❌ NO | Role ki description |
| `permissions` | object | ❌ NO | Module-wise permissions (baad mein PATCH se bhi kar sakte) |

#### Permissions format:
```
{
  "<moduleName>": {
    "view":   true/false,
    "create": true/false,
    "edit":   true/false,
    "delete": true/false
  }
}
```

- `moduleName` — koi bhi string: `"jobs"`, `"interviews"`, `"salary"`, `"onboarding"` etc.
- Saare 4 actions dene zaroori hain agar module de rahe ho
- Jo module nahi doge — woh role mein hoga hi nahi (false treated)

### Request Example
```json
POST /api/roles
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Senior Recruiter",
  "description": "Experienced recruiter with additional access",
  "permissions": {
    "jobs": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "candidates": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "pipeline": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "interviews": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false
    }
  }
}
```

### Response (201)
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "64abc123...",
    "name": "Senior Recruiter",
    "description": "Experienced recruiter with additional access",
    "isSystem": false,
    "userCount": 0,
    "permissions": {
      "jobs":       { "view": true, "create": true,  "edit": true,  "delete": false },
      "candidates": { "view": true, "create": true,  "edit": true,  "delete": false },
      "pipeline":   { "view": true, "create": true,  "edit": true,  "delete": false },
      "interviews": { "view": true, "create": false, "edit": false, "delete": false }
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## API 4 — Role ka Naam / Description Update karo

```
PUT /api/roles/:id
```

**Access:** ADMIN only  
**Sirf naam aur description** — permissions ke liye `PATCH /permissions` use karo

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ❌ optional | Naya naam (system role ka naam nahi badal sakta) |
| `description` | string | ❌ optional | Nayi description |

### Request Example
```json
PUT /api/roles/64abc123...
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "name": "Lead Recruiter",
  "description": "Updated description for lead recruiters"
}
```

### Response
```json
{
  "success": true,
  "message": "Role updated",
  "data": {
    "id": "64abc123...",
    "name": "Lead Recruiter",
    "description": "Updated description for lead recruiters",
    "isSystem": false,
    "userCount": 3,
    "permissions": { ... },
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

---

## API 5 — Role ki Permissions Update karo (Add / Edit / Remove)

```
PATCH /api/roles/:id/permissions
```

**Access:** ADMIN only  
**Ye sabse important API hai** — modules add, edit, ya remove karo

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `set` | object | ❌ optional | Modules add ya update karo |
| `remove` | array of strings | ❌ optional | Ye modules permissions se hatao |

> Dono (`set` + `remove`) ek saath use kar sakte ho.

### `set` mein partial update bhi kar sakte ho

Agar sirf ek action change karna ho toh sirf woh do — baaki same rahenge:
```json
"set": {
  "jobs": { "delete": true }   ← sirf delete update hoga, baaki (view/create/edit) same
}
```

### Request Examples

#### Example 1 — Naya module add karo + ek existing update karo
```json
PATCH /api/roles/64abc123.../permissions
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "set": {
    "interviews": {
      "view": true,
      "create": true,
      "edit": false,
      "delete": false
    },
    "jobs": {
      "delete": true
    }
  }
}
```

#### Example 2 — Kuch modules hatao
```json
PATCH /api/roles/64abc123.../permissions
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "remove": ["headhunter", "reports"]
}
```

#### Example 3 — Add bhi karo, hatao bhi
```json
PATCH /api/roles/64abc123.../permissions
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "set": {
    "salary": { "view": true, "create": false, "edit": false, "delete": false },
    "onboarding": { "view": true, "create": true, "edit": true, "delete": false }
  },
  "remove": ["headhunter"]
}
```

### Response
```json
{
  "success": true,
  "message": "Permissions updated",
  "data": {
    "id": "64abc123...",
    "name": "Senior Recruiter",
    "permissions": {
      "jobs":       { "view": true, "create": true, "edit": true, "delete": true  },
      "candidates": { "view": true, "create": true, "edit": true, "delete": false },
      "pipeline":   { "view": true, "create": true, "edit": true, "delete": false },
      "interviews": { "view": true, "create": true, "edit": false,"delete": false },
      "salary":     { "view": true, "create": false,"edit": false,"delete": false },
      "onboarding": { "view": true, "create": true, "edit": true, "delete": false }
    },
    "userCount": 3,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

---

## API 6 — Role Delete karo

```
DELETE /api/roles/:id
```

**Access:** ADMIN only

### Block conditions (delete nahi hoga agar)
- Role `isSystem: true` hai (ADMIN, RECRUITER, HIRING_MANAGER, etc.)
- Koi bhi user is role pe assigned hai

### Request Example
```
DELETE /api/roles/64abc123...
Authorization: Bearer <adminToken>
```

### Response — Success
```json
{
  "success": true,
  "message": "Role \"Senior Recruiter\" deleted successfully"
}
```

### Response — Blocked (users assigned)
```json
{
  "success": false,
  "message": "3 user(s) is role pe hain. Pehle unka role badlo, phir delete karo.",
  "affectedUsers": 3
}
```

### Response — Blocked (system role)
```json
{
  "success": false,
  "message": "System roles delete nahi ho sakte"
}
```

---

## API 7 — User ka Role Change karo

```
PUT /api/roles/:roleId/assign/:userId
```

**Access:** ADMIN only  
**Dono IDs URL params mein jaate hain — body kuch nahi**

### Params

| Param | Description |
|-------|-------------|
| `roleId` | Jo naya role assign karna hai uska `_id` |
| `userId` | Jis user ka role change karna hai uska `AuthUser._id` |

### Request Example
```
PUT /api/roles/64newrole.../assign/64userid...
Authorization: Bearer <adminToken>
```

### Response
```json
{
  "success": true,
  "message": "User role updated: \"RECRUITER\" → \"Senior Recruiter\"",
  "data": {
    "userId": "64userid...",
    "email": "john@company.com",
    "name": "John Doe",
    "oldRole": "RECRUITER",
    "newRole": "Senior Recruiter",
    "roleId": "64newrole..."
  }
}
```

---

## API 8 — Apni Permissions dekho (Login ke baad)

```
GET /api/roles/my-permissions
```

**Access:** Any authenticated user  
**Login ke baad frontend ye ek call karta hai**

### Request Example
```
GET /api/roles/my-permissions
Authorization: Bearer <userToken>
```

### Response
```json
{
  "success": true,
  "data": {
    "roleId": "64abc123...",
    "role": "Senior Recruiter",
    "permissions": {
      "jobs": {
        "view": true,
        "create": true,
        "edit": true,
        "delete": false
      },
      "candidates": {
        "view": true,
        "create": true,
        "edit": true,
        "delete": false
      },
      "interviews": {
        "view": true,
        "create": false,
        "edit": false,
        "delete": false
      }
    }
  }
}
```

---

## Typical Admin Workflow (Step by Step)

### Step 1 — Pehli baar Admin register karo
```
POST /api/auth/register
{ "firstName": "Admin", "lastName": "User", "email": "admin@co.com", "password": "Admin@123" }
```

### Step 2 — Roles seed karo (ek baar)
```bash
node scripts/seedRoles.js
```

### Step 3 — Custom role banao
```
POST /api/roles
{ "name": "Senior Recruiter", "description": "..." }
```

### Step 4 — Us role mein permissions add karo
```
PATCH /api/roles/<roleId>/permissions
{
  "set": {
    "jobs":       { "view": true, "create": true, "edit": true, "delete": false },
    "candidates": { "view": true, "create": true, "edit": true, "delete": false }
  }
}
```

### Step 5 — User add karo + role assign karo
```
POST /api/users/add-member
{
  "firstName": "Jane",
  "email": "jane@co.com",
  "password": "Pass@123",
  "roleId": "<roleId>"
}
```

### Step 6 — Baad mein user ka role change karna ho
```
PUT /api/roles/<newRoleId>/assign/<userId>
```

### Step 7 — Frontend user ki permissions check kare
```
GET /api/roles/my-permissions
```

---

## Extra/Custom Modules — Kaise Add Karein

System mein hardcoded modules sirf seed ke time hain. Apna naya module add karna ho:

```
PATCH /api/roles/<roleId>/permissions
{
  "set": {
    "salary_bands":  { "view": true, "create": false, "edit": false, "delete": false },
    "offer_letters": { "view": true, "create": true,  "edit": true,  "delete": false },
    "background_check": { "view": true, "create": true, "edit": false, "delete": false }
  }
}
```

**Koi schema change nahi** — `Map` use hoti hai, koi bhi string key chalti hai.

---

## Error Codes Reference

| Code | Reason |
|------|--------|
| 400 | Validation fail — required field missing ya invalid format |
| 401 | Token nahi diya ya expired |
| 403 | Is action ka permission nahi (ADMIN required) |
| 404 | Role ya User nahi mila |
| 409 | Role naam already exists |
| 500 | Server error |

---

## Summary Table

| API | Method | URL | Body | Response |
|-----|--------|-----|------|----------|
| Roles list (NO permissions) | GET | `/api/roles?page=1&limit=10&search=x` | — | id, name, desc, userCount, pagination |
| Role detail (WITH permissions) | GET | `/api/roles/:id` | — | Full role + permissions |
| Role banao | POST | `/api/roles` | name, description, permissions | Created role |
| Role naam/desc update | PUT | `/api/roles/:id` | name?, description? | Updated role |
| Permissions update | PATCH | `/api/roles/:id/permissions` | set?, remove? | Updated role with permissions |
| Role delete | DELETE | `/api/roles/:id` | — | Success / Error |
| User ka role change | PUT | `/api/roles/:roleId/assign/:userId` | — (URL params only) | Old + new role info |
| Apni permissions | GET | `/api/roles/my-permissions` | — | role name + permissions object |

Till now, the Create Role, Update Role, and Delete Role functionalities are done. In Create Team, when going to the User section, there should be an option to assign a role to the user. Also, in Create Team, add a ‘show/hide password’ (eye) button in the password field.

The UI also needs to be updated according to the MD file I provided. Please connect all APIs properly in a structured way.

Permissions should depend on the sidebar — meaning, the permissions list should match the routes available in the sidebar, so that the admin can assign permissions accordingly.”