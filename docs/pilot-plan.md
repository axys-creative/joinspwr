# Join SPWR: Recruiting Growth Pilot Plan

> **Status: planning only. Do not write or change code for this plan yet.**
> This file gives context so you can answer "what's the plan?" or "what's the roadmap?" Wait for Aaron to explicitly start a task before building anything.

## Background

- **Client:** SunPower (formerly Complete Solaria), based in Orem, Utah.
- **This repo:** the recruiter / internal sales rep site (Join SunPower). The sales force drives about 90% of SunPower's revenue, so recruiting reps is a priority.
- **Current setup:** Netlify hosting, Netlify forms with a separate form ID per campaign, Google Analytics tracking by URL (e.g. `/apply` pages for billboards and promotions). Aaron also provides the CMS tool for this site.
- **Already scheduled (separate from the pilot):** November 2026 Shopify API integration for the site. This is its own project and is **not** part of the pilot.

## The pilot (proposed, not yet approved)

A 90-day pilot to help SunPower recruit more sales reps through this site. Their marketing team brings the traffic; the pilot makes sure candidates can find the site and that it turns visitors into applicants.

### Two goals

1. **Get found:** SEO plus AI search visibility (Google, ChatGPT, Perplexity, Google AI results). Earn a place in results for recruiting searches like "solar sales jobs," "join solar sales," and "solar sales jobs in [city]" by being genuinely relevant. No keyword stuffing.
2. **Convert:** turn more visitors into submitted applications from traffic SunPower already pays for.

### Monthly deliverables

- 2 to 4 recruiting blog posts (pay, training, career growth), each ending with a clear path to apply. Only use pay figures SunPower has approved.
- 1 new landing page per month for a promotion, billboard, or hiring city, each with its own tracked form.
- A results report: visitors, applications, completion rate by page, plus one improvement shipped based on the numbers.

### Also included

- Job posting structured data (JobPosting markup) so openings can appear in Google's job search.
- AI answer optimization (clear, citable answers about solar sales careers).
- Month-one review of the apply flow and page speed, with fixes.

### What we measure (site-controlled only)

| Area | What we track |
| --- | --- |
| Search rankings | Position for target recruiting searches (via Google Search Console) |
| Visibility | Pages indexed, job listings in Google, mentions in AI answers |
| Conversion | Application completion rate (started vs. submitted), drop-off points |
| Performance | Page speed and Core Web Vitals |

Traffic volume belongs to SunPower's marketing team, not this pilot.

## Roadmap

- **Now (Oct 2026):** pitch prep. Meeting with the creative director, then a pitch to the CMO.
- **Nov 2026:** ship the Shopify integration (separate project). Pitch the pilot around handoff.
- **Month 1, Foundation:** baseline numbers; set up GA4 events (page view → Apply click → form started → submitted) and Google Search Console; job pages and markup; first articles; apply-flow review (mobile, field count, steps, load time).
- **Month 2, Build:** location/city landing pages, more articles, AI answer optimization, apply-flow and speed improvements.
- **Month 3, Prove it:** refine based on data; day-90 review with a stop / continue / scale recommendation.
- **After day 90 (Growth Plan):** more posts and landing pages, plus A/B testing (likely Netlify split testing) on headlines and form length.

## Likely conversion fixes (once approved)

- Shorten the apply form (name, phone, email, zip).
- Sticky Apply button on mobile.
- Job pages that answer pay, training, and day-in-the-life questions.
- Rep quotes / success stories (with permission).

## Open questions

- Do all applications go through Netlify forms, or do candidates finish in a separate hiring system (Workday, Greenhouse, etc.)? This affects how much of the apply flow we control.
- Access to existing GA4 and Google Search Console.
- Who approves content and pay figures.

## Working notes for Claude Code

- Aaron is new to SEO, analytics, and A/B testing. Explain steps plainly and go one step at a time.
- Keep the existing per-campaign landing page and form ID pattern; new landing pages should follow it.
- Don't publish income claims unless SunPower has approved the figures.
- When the plan changes, Aaron will update this file.
