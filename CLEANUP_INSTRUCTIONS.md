# 🧹 Cleanup Instructions

## ⚠️ IMPORTANT: Security Cleanup Required

The bootstrap function is still deployed in Firebase Functions. **You MUST delete it manually for security reasons**.

### Delete the Bootstrap Function

Run this command in your terminal:

```bash
firebase functions:delete bootstrapSuperadmin --region us-central1
```

When prompted, type `y` to confirm deletion.

### Why This is Important

The bootstrap function allows anyone with the secret key to create superadmin users. It should be deleted immediately after creating your first superadmin.

### Verification

After deletion, verify the function is gone by checking:
```bash
firebase functions:list
```

The `bootstrapSuperadmin` function should not appear in the list.

## ✅ What's Been Cleaned Up

- ✅ Bootstrap function source code removed from codebase
- ✅ Bootstrap script file deleted
- ✅ Function exports removed from index.ts
- ⚠️ **PENDING**: Manual deletion of deployed function (see above)

## 🔒 Security Notes

- The bootstrap function had a hardcoded secret key: `calendado-bootstrap-2024-secret-key`
- This secret is now obsolete and safe to discard
- The function can only create `robertodias@gmail.com` as superadmin (hardcoded)
- Once deleted, this attack vector is completely eliminated

---

**Delete this file after completing the cleanup!**
