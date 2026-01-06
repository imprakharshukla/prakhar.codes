# Job Application Tracker Guide

## How to Use

1. **Import to Google Sheets:**
   - Open Google Sheets
   - File → Import → Upload → Select `job-application-tracker.csv`
   - Import and done!

2. **Or use Excel/Numbers:**
   - Open the CSV file directly
   - Save as .xlsx if you want

---

## Column Definitions

**Company** - Company name (e.g., "Braintrust", "Reducto", "Mintlify")

**Role** - Position title (e.g., "Full-Stack Engineer", "Founding Engineer")

**Date Applied** - When you submitted application (YYYY-MM-DD format)

**Status** - Current stage. Options:
- 🟡 Applied
- 🔵 Screening Call
- 🟣 Technical Interview
- 🟢 Final Round
- ⭐ Offer
- ❌ Rejected
- 🕒 Waiting
- 📧 Email Sent

**Contact Person** - Name of recruiter/founder you spoke with

**Contact Email** - Their email for follow-ups

**Source** - Where you found it:
- YC Work at Startup
- LinkedIn
- Cold Email
- Referral
- AngelList
- Braintrust
- etc.

**Location** - Remote / City / Hybrid

**Salary/Rate** - e.g., "$90/hr", "$120K-$160K", "Competitive"

**Last Action** - What you did last (e.g., "Submitted application", "Had screening call", "Sent thank you email")

**Next Follow-up** - Date to follow up (1 week after applying, 3 days after interview, etc.)

**Interview Date** - Scheduled interview date/time

**Notes** - Any important details:
- Tech stack match
- Why you're interested
- Questions they asked
- Things to mention in interview
- Red flags

**Job URL** - Link to original posting

---

## Status Workflow

```
Applied → Screening Call → Technical Interview → Final Round → Offer
   ↓           ↓                    ↓                 ↓
Rejected    Rejected            Rejected          Rejected
```

---

## Weekly Review Checklist

**Every Monday:**
- [ ] Update all statuses
- [ ] Send follow-ups for applications >1 week old with no response
- [ ] Schedule interviews for the week
- [ ] Apply to 10-15 new positions
- [ ] Send 5-10 cold emails

**After Each Interview:**
- [ ] Send thank you email within 24 hours
- [ ] Update notes with questions asked and your answers
- [ ] Set follow-up reminder for 3-5 days

**After Rejection:**
- [ ] Ask for feedback (politely)
- [ ] Update notes with what to improve
- [ ] Keep them in tracker (future opportunities)

---

## Tips for Staying Organized

**Color Code by Priority:**
- 🔴 High Priority - Dream companies, strong match
- 🟡 Medium Priority - Good fit, worth pursuing
- 🟢 Low Priority - Backup options

**Track Response Rates:**
- Add a "Response Rate" row at top
- Calculate: (Responses / Applications) × 100
- Aim for >30% response rate
- If lower, improve your outreach

**Weekly Goals:**
- 10-15 applications via job boards
- 5-10 cold emails to founders
- 2-3 referral requests
- 1-2 interviews

**Follow-up Timing:**
- After application: 1 week
- After screening: 3-5 days
- After technical: 2-3 days
- After final: 1-2 days

---

## Sample Entries

```
Company: Reducto
Role: Founding Engineer
Date Applied: 2026-01-05
Status: 🟡 Applied
Contact: Hamzah (via Twitter)
Source: YC + Twitter DM
Location: Remote (GMT ± 3)
Salary: $100K-$170K + 0.10-0.30%
Last Action: Sent YC application + Twitter DM
Next Follow-up: 2026-01-12
Notes: Vision-first document understanding. Perfect match for AI experience. Mentioned Yobr AI agents in application.
URL: https://www.ycombinator.com/companies/reducto/jobs/...
```

```
Company: Mintlify
Role: Software Engineer
Date Applied: 2026-01-04
Status: 📧 Email Sent
Contact: Nick (Founder)
Email: nick@mintlify.com
Source: Cold Email
Location: Remote
Salary: TBD
Last Action: Sent cold email about SWE role
Next Follow-up: 2026-01-11
Notes: Dev tools for docs. I appreciate good documentation (mentioned in email). Keep it casual.
URL: https://mintlify.com/careers
```

---

## Analytics to Track

**Monthly:**
- Total applications sent
- Response rate (%)
- Interview conversion rate
- Offer conversion rate
- Average time to response
- Top performing sources

**What to Measure:**
- Which sources get best response rates?
- Which companies respond fastest?
- What type of roles get most interviews?
- Cold email vs application response rates

---

## Notion/Airtable Alternative

If you prefer more features, import this into:
- **Notion** - Better for notes and linking
- **Airtable** - Better for filtering and views
- **Coda** - Better for automation

But honestly, **Google Sheets is enough**. Don't over-engineer your job search.

---

## File Location

`/Users/prakharshukla/code/personal/prakhar.codes/job-application-tracker.csv`

**This file is gitignored** - won't get committed to your public repo.

---

Good luck with the search! 🚀
