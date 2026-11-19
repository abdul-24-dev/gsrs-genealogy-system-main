# Genealogical Search and Record System (GSRS)

A modern, local-first web application designed for families, ancestral clans, and community genealogists to digitally preserve lineage records, build interactive family trees, document historical relationships, and archive historical certificates and photographs.

Originally conceptualized as an academic development project for families and communities in **Nasarawa State, Nigeria** and broader African heritage archives.

---

## 🌟 Key Capabilities

- **PostgreSQL-Backed Architecture**: Stores family records in PostgreSQL so the app can run locally, on a private network, or on a hosted platform such as Vercel.
- **First-Time Setup Wizard**: Automatically guides a new family administrator through a secure onboarding process on fresh installations.
- **Relational Lineage Engine**: Strict relational integrity using unique member IDs (e.g., `GSRS-1001`). Prevents invalid circular ancestry and self-parenting loops while supporting multi-spouse unions.
- **Multi-Generational Interactive Family Tree**: Zoom, drag, and pan across great-grandparents, grandparents, parents, children, and grandchildren with horizontal and vertical layout toggling.
- **Genealogical Multi-Criteria Search**: Query by full name, surname, clan, birthplace, birth decade, generation level, community, or state.
- **Historical Document & Photo Archive**: Upload and store birth certificates, marriage certificates, wills, and historical family portraits safely on disk.
- **Official Reports & Exports**: Instantly generate printable PDF dossiers and CSV spreadsheet downloads.
- **Demographics & Analytics**: Visual charts for generational distributions, birth decade trends, and gender ratios.
- **Document Backup & Portability**: Export uploaded documents into a portable `.zip` archive. Use your PostgreSQL provider's backup tooling for database records.

---

## 💻 System Requirements

- **Operating System**: Windows 10, Windows 11, or Windows Server (also compatible with macOS and Linux)
- **Runtime**: [Node.js](https://nodejs.org) (v18.x, v20.x, or newer LTS)
- **Database**: PostgreSQL 14+ (local or hosted). Set `DATABASE_URL` in `.env` or in your hosting provider's environment variables.
- **Memory (RAM)**: 4 GB minimum (8 GB recommended)
- **Disk Storage**: At least 500 MB free space for the application and database

---

## 🚀 Easy Installation Guide (For the Owner / Client)

### Step 1: Install Node.js (Only Once)
If Node.js is not already installed on your computer:
1. Visit the official website: [https://nodejs.org](https://nodejs.org)
2. Download and run the **LTS (Long Term Support)** installer for Windows.
3. Accept the default options and finish installation.

### Step 2: Download the Project
1. On GitHub, click the green **Code** button and choose **Download ZIP** (or clone via Git: `git clone <repository-url>`).
2. Extract the ZIP folder to your preferred location (e.g., `C:\GSRS` or `Desktop`).
3. Open `.env` and replace `DATABASE_URL` with your PostgreSQL connection string. For hosted databases, use the non-pooling connection URL so migrations can run.

### Step 3: Run One-Click Installation
1. Open the folder and double-click **`INSTALL.bat`**.
2. The automated wizard will automatically:
   - Check Node.js runtime.
   - Install all required libraries.
   - Apply PostgreSQL database migrations.
   - Build the optimized production application.
3. When installation finishes, press any key to close the window.

---

## 🏁 How to Run the System

### Option A: Fresh Start (Real Family Use)
1. Double-click **`START.bat`**.
2. Your browser will automatically open `http://localhost:3000`.
3. Complete the **First-Time Setup Wizard** (`/setup`) to configure your family archive name and Master Administrator password.

### Option B: Quick Testing (With Sample Demo Data)
If you want to immediately test the system with pre-populated records:
1. Double-click **`SEED.bat`**.
2. This creates 3 generations of sample family members (Danladi Ancestral Dynasty) and 4 test accounts:

| Role | Email Address | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gsrs.local` | `Password123!` | Full control, user management, backups, database reset |
| **Admin** | `archivist@gsrs.local` | `Password123!` | Manage families, members, tree, documents, and reports |
| **Contributor** | `contributor@gsrs.local` | `Password123!` | Add/edit members and upload historical documents |
| **Viewer** | `viewer@gsrs.local` | `Password123!` | Read-only access to records, search, and family tree |

3. Double-click **`START.bat`** and log in with any account above.

---

## 🔄 Receiving Updates From GitHub

Whenever the developer adds new features, improves designs, or fixes issues:
1. Double-click **`UPDATE.bat`**.
2. The update script will automatically:
   - Pull the latest code updates from GitHub.
   - Update libraries and database migrations.
   - Rebuild the application.
   - **Important**: Your local database, uploaded photos, and personal family records are **100% preserved and never overwritten**.
3. Double-click **`START.bat`** to enjoy the updated version!

---

## 🛑 How to Stop the System

- Simply double-click **`STOP.bat`** to cleanly shut down background processes and flush the database to disk.

---

## 💾 Backup and Transfer to Another Laptop

1. **Inside the App**: Navigate to **System Settings** -> Click **"Create Full Backup"** -> Click **"Download Backup (.zip)"**.
2. **From Windows Explorer**: Double-click **`BACKUP.bat`**. A timestamped ZIP archive will be saved in `storage\backups\`.
3. **Restoring**: On any new laptop, install GSRS, go to **System Settings**, click **Restore Backup**, and select your `.zip` archive. All records, members, trees, and uploaded certificates will be instantly restored.

---

## 🔧 Technical Details for Developers

- **Framework**: Next.js 15 (App Router with Server Actions & API Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom Emerald Health & Longevity Palette)
- **Database**: PostgreSQL with Prisma migrations
- **ORM**: Prisma Client v5
- **Icons**: Lucide React
- **Analytics**: Recharts
- **PDF Generation**: jsPDF & jsPDF-Autotable
- **Compression**: Adm-Zip & Archiver

### Developer NPM Commands
```bash
npm run dev     # Run development server
npm run build   # Compile production bundle
npm run start   # Run production server
npx prisma studio # Visual database explorer
```

---

## 🛡️ License
MIT License. Developed for academic preservation of Nigerian family history, ancestral lineages, and cultural heritage across generations.
