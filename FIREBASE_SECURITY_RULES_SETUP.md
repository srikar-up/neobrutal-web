# 🛡️ Firebase Security Rules & Admin Access Guide

This guide explains how admin authorization works for **Opinawaz Universal Public School** and **where to add new authorized emails in the future**.

---

## 🎯 How It Works

1. **Zero Client-Side Exposure**:
   - No email addresses are exposed in the frontend code or visible to the public.
   - The UI shows generic secure authentication: *"Authorized institutional accounts only"*.

2. **Database-Level Enforcement**:
   - Authorization is enforced by **Google Cloud Firestore Security Rules**.
   - When any Google account logs in, the application tests access against the private `inquiries` database.
   - If the email is in the authorized list, Firestore grants read/write permissions.
   - If the email is **not** authorized, Firestore returns `permission-denied`. The website immediately logs them out and sends them back to the home page.

---

## 📋 Current Security Rules (Including `mohsinnawaz9541@gmail.com`)

Copy the rules below and paste them into your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // =========================================================================
    // 🔑 AUTHORIZED ADMINISTRATOR WHITELIST
    // WHERE TO ADD NEW EMAILS IN THE FUTURE:
    // Simply add ,"newemail@gmail.com" inside the brackets below!
    // =========================================================================
    function isAuthorizedAdmin() {
      return request.auth != null && 
             request.auth.token.email in [
               "your_admin_email@gmail.com",
               "second_admin_email@gmail.com"
               // Example for future:
               // ,"principal@opnawaz.edu",
               // ,"newadmin@gmail.com"
             ];
    }

    // Admission Leads / Inquiries:
    // Anyone on public website can submit leads; only authorized admins can read or manage
    match /inquiries/{docId} {
      allow create: if true;
      allow read, update, delete: if isAuthorizedAdmin();
    }

    // Public Website Content (Announcements, Toppers, Activities, FAQs, Settings):
    // Public visitors can read; only authorized admins can create, update, or delete
    match /announcements/{docId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
    match /toppers/{docId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
    match /activities/{docId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
    match /faqs/{docId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
    }
  }
}
```

---

## 🚀 How & Where to Add New Emails in the Future

Whenever you want to give admin access to a new email address:

1. Open **[Firebase Console → Firestore Database → Rules](https://console.firebase.google.com/project/opnawazschool/firestore/rules)**.
2. Locate the `isAuthorizedAdmin()` function near the top.
3. Inside the `in [ ... ]` list, add a comma and the new email wrapped in quotation marks:
   ```javascript
    request.auth.token.email in [
      "your_admin_email@gmail.com",
      "second_admin_email@gmail.com",
      "newperson@gmail.com"
    ];
   ```
4. Click the blue **Publish** button in the top right.

✨ **Done!** The new email will immediately be allowed to log into the Admin Panel, without needing to touch any code or rebuild/redeploy the website. Any unlisted email will be automatically blocked and redirected to the home page.
