# Google Indexing API Setup Guide

**Automatically submit blog posts to Google for faster search indexing**

## Overview

The Google Indexing API allows you to notify Google immediately when new content is published or updated, drastically reducing the time it takes for your blog posts to appear in search results. Instead of waiting days or weeks for Google's crawlers to discover your content, submissions can be indexed within hours.

**Benefits:**

- ✅ New blog posts submitted to Google within minutes of publishing
- ✅ Updates trigger immediate re-crawl requests
- ✅ Better search visibility for time-sensitive content
- ✅ Automatic submission via Inngest background jobs
- ✅ Batch processing for backfilling existing posts

**Default Quota:** 200 URL submissions per day (sufficient for most blogs)

---

## Prerequisites

Before you begin, ensure you have:

- A Google account with access to Google Cloud Platform
- Owner access to your domain in Google Search Console
- Your domain verified in Google Search Console
- Approximately 15-20 minutes for initial setup

---

## Step 1: Create Google Cloud Platform Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a new project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `dcyfr-labs-indexing` (or your preferred name)
   - Click "Create"
   - Wait for project creation (takes ~30 seconds)

3. **Select your new project**
   - Click the project dropdown again
   - Select your newly created project

---

## Step 2: Enable Required APIs

### Enable Indexing API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"
   - Or visit: https://console.cloud.google.com/apis/library

2. **Search for Indexing API**
   - In the search box, type "Indexing API"
   - Click on "Indexing API" from the results

3. **Enable the API**
   - Click the "Enable" button
   - Wait for activation (~10 seconds)

### Enable Google Search Console API

1. **Return to API Library**
   - Click "APIs & Services" > "Library" again

2. **Search for Search Console API**
   - Type "Google Search Console API" in the search box
   - Click on the result

3. **Enable the API**
   - Click "Enable"
   - Wait for activation

---

## Step 3: Create Service Account

1. **Navigate to Service Accounts**
   - Click "APIs & Services" > "Credentials"
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create Service Account**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "Service account"

3. **Configure Service Account Details**
   - **Service account name:** `indexing-service`
   - **Service account ID:** (auto-generated, e.g., `indexing-service@your-project.iam.gserviceaccount.com`)
   - **Description:** `Service account for Google Indexing API`
   - Click "CREATE AND CONTINUE"

4. **Grant Permissions (Optional)**
   - You can skip the "Grant this service account access to project" section
   - Click "CONTINUE"

5. **Grant User Access (Optional)**
   - Skip this section as well
   - Click "DONE"

---

## Step 4: Generate Service Account Key (JSON)

1. **Find Your Service Account**
   - In the Service Accounts list, find `indexing-service@...`
   - Click on the service account name

2. **Create Key**
   - Click the "KEYS" tab
   - Click "ADD KEY" > "Create new key"

3. **Download JSON Key**
   - Select "JSON" as the key type
   - Click "CREATE"
   - A JSON file will download automatically (e.g., `your-project-abc123.json`)

4. **⚠️ Important: Secure Your Key**
   - This file contains sensitive credentials
   - Never commit this file to version control
   - Store it securely (we'll use it as an environment variable)

---

## Step 5: Add Service Account to Google Search Console

1. **Get Service Account Email**
   - Open the downloaded JSON file
   - Find the `"client_email"` field
   - Copy the email address (e.g., `indexing-service@your-project.iam.gserviceaccount.com`)

2. **Open Google Search Console**
   - Visit: https://search.google.com/search-console
   - Select your verified property (e.g., `https://www.dcyfr.ai`)

3. **Add User**
   - Click "Settings" in the left sidebar
   - Click "Users and permissions"
   - Click "ADD USER"

4. **Configure Permissions**
   - **Email address:** Paste the service account email
   - **Permission level:** Select "Owner"
   - Click "ADD"

---

## Step 6: Configure Environment Variable

1. **Format JSON Key for Environment Variable**
   - Open the downloaded JSON file
   - Copy the entire contents
   - Ensure it's a single line with escaped quotes

2. **Add to `.env.local`**

   ```bash
   # Replace <YOUR_SERVICE_ACCOUNT_JSON> with your actual service account JSON from Google Cloud Console
   GOOGLE_INDEXING_API_KEY='<YOUR_SERVICE_ACCOUNT_JSON>'
   ```

3. **For Production (Vercel)**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add a new variable:
     - **Name:** `GOOGLE_INDEXING_API_KEY`
     - **Value:** Paste the JSON contents
     - **Environments:** Select "Production", "Preview", "Development"
   - Click "Save"

---

## Step 7: Test the Integration

### Test via Inngest Dev UI (Local Development)

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Open Inngest Dev UI**
   - Visit: http://localhost:3000/api/inngest
   - You should see the Google indexing functions listed

3. **Test URL Submission**
   - Click on "submit-url-to-google"
   - Click "Test" in the top-right
   - Enter test data:
     ```json
     {
       "url": "https://www.dcyfr.ai/blog/your-post-slug",
       "type": "URL_UPDATED"
     }
     ```
   - Click "Invoke Function"

4. **Check Results**
   - Watch the function execution in real-time
   - Look for success message: `✓ Submitted ... to Google Indexing API`
   - Check logs for any errors

### Test via Code (Programmatic)

Create a test script `scripts/test-google-indexing.mjs`:

```javascript
import { inngest } from './src/inngest/client.js';

async function testIndexing() {
  const result = await inngest.send({
    name: 'google/url.submit',
    data: {
      url: 'https://www.dcyfr.ai/blog/test-post',
      type: 'URL_UPDATED',
    },
  });

  console.log('Indexing request sent:', result);
}

testIndexing().catch(console.error);
```

Run the test:

```bash
node scripts/test-google-indexing.mjs
```

---

## Usage Examples

### Automatic Submission (Recommended)

When publishing new blog posts, the system can automatically trigger indexing:

```typescript
// In your blog publishing workflow
import { inngest } from '@/inngest/client';

async function publishBlogPost(post) {
  // ... publish logic ...

  // Automatically submit to Google
  await inngest.send({
    name: 'google/url.submit',
    data: {
      url: `https://www.dcyfr.ai/blog/${post.slug}`,
    },
  });
}
```

### Batch Submit Existing Posts

To backfill all existing blog posts:

```typescript
// scripts/backfill-google-indexing.mjs
import { inngest } from './src/inngest/client.js';
import { getAllPosts } from './src/lib/blog.js';

async function backfillIndexing() {
  const posts = getAllPosts();

  const urls = posts.map((post) => `https://www.dcyfr.ai/blog/${post.slug}`);

  await inngest.send({
    name: 'google/urls.batch-submit',
    data: { urls },
  });

  console.log(`Submitted ${urls.length} URLs to Google for indexing`);
}

backfillIndexing().catch(console.error);
```

Run the backfill:

```bash
node scripts/backfill-google-indexing.mjs
```

### Manual Submission

For manual control:

```typescript
import { inngest } from '@/inngest/client';

// Submit a single URL
await inngest.send({
  name: 'google/url.submit',
  data: {
    url: 'https://www.dcyfr.ai/blog/new-post',
    type: 'URL_UPDATED',
  },
});

// Delete a URL from index
await inngest.send({
  name: 'google/url.delete',
  data: {
    url: 'https://www.dcyfr.ai/blog/removed-post',
  },
});
```

---

## Quota Management

### Default Quota

- **200 URL submissions per day** (includes both updates and deletions)
- **180 metadata requests per minute**
- **380 total requests per minute** (across all endpoints)

### Request Quota Increase

If you need more than 200 submissions per day:

1. **Visit Quota Request Form**
   - Go to: https://developers.google.com/search/apis/indexing-api/v3/quota-pricing

2. **Fill Out Request**
   - Explain your use case
   - Justify the need for higher quota
   - Provide examples of your content quality

3. **Wait for Approval**
   - Google reviews requests manually
   - High-quality content is more likely to get approved
   - Typical turnaround: 1-2 weeks

---

## Troubleshooting

### Error: 403 Forbidden

**Cause:** Service account not added as owner in Google Search Console

**Solution:**

1. Verify service account email is added to Search Console
2. Ensure permission level is "Owner" (not "Full" or "Restricted")
3. Wait 5-10 minutes for permissions to propagate

### Error: 401 Unauthorized

**Cause:** Invalid or expired credentials

**Solution:**

1. Verify JSON key is correctly formatted in environment variable
2. Check that both Indexing API and Search Console API are enabled
3. Regenerate service account key if needed

### Error: 429 Too Many Requests

**Cause:** Exceeded daily quota (200 requests/day)

**Solution:**

1. Wait until quota resets (midnight Pacific Time)
2. Implement rate limiting in your code
3. Request quota increase from Google
4. Use batch processing to space out requests

### No Response / Silent Failures

**Cause:** `GOOGLE_INDEXING_API_KEY` not configured

**Solution:**

1. Verify environment variable is set
2. Check `.env.local` file exists and contains the key
3. Restart development server after adding variable
4. Check Inngest function logs for warnings

---

## Monitoring & Verification

### Check Submission Status

You can verify submissions in Google Search Console:

1. **Visit URL Inspection Tool**
   - https://search.google.com/search-console/inspect
   - Enter a URL you submitted

2. **Check Indexing Status**
   - Look for "Last crawl" date
   - Should show recent crawl after submission

3. **View Coverage Report**
   - Go to "Coverage" in Search Console
   - Monitor indexed vs. submitted URLs

### Monitor via Inngest

1. **Visit Inngest Dashboard**
   - https://app.inngest.com/
   - Select your project

2. **View Function Runs**
   - Click on "submit-url-to-google" function
   - Review execution history
   - Check success/failure rates

---

## Best Practices

1. **Submit Immediately After Publishing**
   - Trigger indexing as soon as content goes live
   - Don't wait for organic crawling

2. **Space Out Batch Requests**
   - Don't submit all URLs at once
   - Use the batch function which adds delays

3. **Monitor Quota Usage**
   - Track daily submission count
   - Request increase before hitting limits

4. **Handle Errors Gracefully**
   - The Inngest function includes automatic retries
   - Log failures for investigation
   - Don't let indexing errors block publishing

5. **Verify Content Quality**
   - Ensure pages have proper structured data (optional but recommended)
   - Use valid HTML and proper meta tags
   - Google may reject low-quality submissions

---

## Security Considerations

1. **Never Commit Credentials**
   - Add `*.json` to `.gitignore` for service account keys
   - Use environment variables for all deployments

2. **Rotate Keys Regularly**
   - Regenerate service account keys every 6-12 months
   - Delete old keys from Google Cloud Console

3. **Restrict Service Account Permissions**
   - Only grant necessary API access
   - Don't reuse keys across projects

4. **Monitor API Usage**
   - Set up alerts for unusual activity
   - Review function logs regularly

---

## Additional Resources

- **Google Indexing API Documentation:** https://developers.google.com/search/apis/indexing-api/v3/quickstart
- **Inngest Documentation:** https://www.inngest.com/docs
- **Google Search Console:** https://search.google.com/search-console
- **API Reference:** https://developers.google.com/search/apis/indexing-api/v3/reference/indexing/rest

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Inngest function logs at http://localhost:3000/api/inngest
3. Verify setup steps are completed correctly
4. Check Google Search Console for verification issues
5. Review Google Cloud Console for API enablement status

For questions specific to this implementation, open an issue in the repository.
