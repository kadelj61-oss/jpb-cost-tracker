# Job Cost Tracker — Deploy Guide

This turns the app into a real website with its own address, backed by a real
database. Everything below is done by clicking around in a browser — no
command line, no coding.

It takes about 10 minutes and costs nothing (both services below have a free
tier that's more than enough for one person tracking a handful of jobs).

Your data is not included in this project — it lives in the database you set
up in Step 2, and Step 2 also seeds it automatically with your existing
Strand South Tower job (all 176 PO lines and 184 invoices) the first time the
app runs, so nothing is lost.

---

## Step 1 — Put the code on GitHub

1. Go to [github.com](https://github.com) and create a free account if you
   don't have one.
2. Click the **+** in the top right → **New repository**.
3. Name it `job-cost-tracker` (or anything you like). Leave it **Private**.
   Click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. Unzip the file I gave you, then drag the *contents* of the folder
   (not the folder itself) into the browser window — all the files and
   folders (`app`, `lib`, `package.json`, etc.).
6. Scroll down and click **Commit changes**.

## Step 2 — Create the site on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Sign Up** →
   **Continue with GitHub**. This links the two automatically.
2. Click **Add New...** → **Project**.
3. Find `job-cost-tracker` in the list and click **Import**.
4. Don't click Deploy yet — first add the database:
   - Open a new tab, go back to your Vercel dashboard → **Storage** tab →
     **Create Database** → choose **Postgres** → give it any name → **Create**.
   - On the screen that follows, **connect it to your `job-cost-tracker`
     project** (there's a "Connect Project" step) — this automatically adds
     the database connection details, no copy-pasting required.
5. Back in your project → **Settings** → **Environment Variables**. Add one:
   - Name: `APP_PASSWORD`
   - Value: any password you'll remember — this is what you'll type to log
     into the app.
   - Click **Save**.
6. Go to the **Deployments** tab and click **Deploy** (or **Redeploy** if it
   already tried once before you added the password).
7. After a minute or two you'll get a live URL like
   `job-cost-tracker-yourname.vercel.app`. Open it, enter the password you
   picked, and you're in.

## After that

- Bookmark the URL — that's your app from now on, from any computer.
- The first time it loads, it quietly creates its database tables and loads
  your Strand South Tower job. You won't need to do anything for that.
- To change the password later: Vercel → your project → Settings →
  Environment Variables → edit `APP_PASSWORD` → Redeploy.
- Every time you want to update the app in the future, upload the changed
  files to the same GitHub repo the same way as Step 1.5 — Vercel redeploys
  automatically within a minute of any GitHub change.
