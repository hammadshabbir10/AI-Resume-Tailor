# Assignment 2: Blog Summariser

A Next.js application that allows users to summarize and translate blogs using AI-powered tools.

## Features

### 🎨 Landing Page
- White background with horizontal blogger images
- Blue color scheme and modern UI design
- Featured blogs display with summarize/translate options
- How it works section with step-by-step guide

### 🔐 Authentication
- User signup with email verification
- Login functionality
- Protected routes for authenticated users

### 📝 Blog Management
- Display demo blogs with AI summarization
- Enter custom blog URLs or text
- Agent-based workflow:
  - Agent 1: Enter blog content
  - Agent 2: AI summarization
  - Agent 3: Translate to Urdu
  - Agent 4: Save to database

### 💾 Database Integration
- **MongoDB Atlas**: Store full blog text
- **Supabase**: Store summaries and user data

### 👤 User Features
- My Blogs page (user's saved blogs)
- Favorites page (favorite blog summaries)
- User profile management

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI
- **Database**: MongoDB Atlas, Supabase
- **Deployment**: Vercel


## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features in Development

- [x] Landing page with blogger images
- [x] Basic UI components (Button, Card)
- [x] Demo blogs display
- [ ] Authentication system
- [ ] Blog summarization logic
- [ ] Urdu translation
- [ ] Database integration
- [ ] User dashboard

## Deployment

The application is configured for deployment on Vercel. Simply connect your GitHub repository and deploy with the following settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Contributing

This is an assignment project for the Nexium Internship program. All code follows Next.js and TypeScript best practices.

