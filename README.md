# CleanLoop AI

A hackathon-ready front-end prototype for reporting waste hotspots, grouping likely duplicate reports, prioritizing cleanup tasks, and tracking resolution.

## Stack
- React + JavaScript
- Vite
- Lucide React icons
- Local browser storage for demo records

## Run locally
1. Install Node.js LTS from https://nodejs.org/
2. Open this folder in VS Code.
3. In the VS Code terminal run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the localhost URL shown in the terminal.

## Deploy on Vercel
1. Push this project to a GitHub repository.
2. Go to https://vercel.com/ and sign in with GitHub.
3. Select **Add New → Project** and import the repository.
4. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
5. Click **Deploy**.

Alternative: Netlify at https://www.netlify.com/ — import the GitHub repository, build command `npm run build`, publish directory `dist`.

## Prototype limitations
This is a front-end demo. Records are saved in the current browser using localStorage and are not shared between different users/devices. Image analysis, authentication, a shared database, and real municipal integrations are not implemented. Do not upload private or sensitive images. Use the app's demo data for judging until a backend is added.
