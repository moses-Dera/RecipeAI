# RecipeAI — UI/UX Design Specification

This document outlines the design system, aesthetics, and user interface specifications for the RecipeAI web application. 

## Vision & Aesthetics

> [!IMPORTANT]
> **Core Aesthetic:** Premium, modern, and vibrant. The application must not look like a basic generic template. We will employ glassmorphism, tailored HSL color palettes, modern typography, and smooth micro-animations to ensure the app feels state-of-the-art and engaging. 

Our goal is to make discovering traditional Nigerian cuisine as visually appealing and frictionless as ordering from a modern delivery app.

---

## 1. Typography
We will use modern, highly legible fonts from Google Fonts.

- **Primary Font (Headings & Display):** `Outfit` — Geometric, bold, and modern. Perfect for recipe titles and primary marketing copy.
- **Secondary Font (Body & UI text):** `Inter` — Highly legible, clean sans-serif for ingredient lists, recipe steps, and dense UI elements.

## 2. Color Palette & Theming (CSS Variables)
We will implement seamless Light and Dark modes using CSS variables, ensuring the UI always feels legible and premium.

### CSS Variables Setup
```css
:root {
  /* Light Mode (Warm & Inviting) */
  --bg-primary: 38 71% 97%; /* #FDFBF7 - Warm off-white */
  --bg-surface: 0 0% 100%;  /* #FFFFFF - Pure white for cards */
  --text-primary: 220 20% 15%;
  --text-secondary: 220 15% 40%;
  
  --brand-primary: 14 85% 55%; /* Spicy Orange */
  --brand-secondary: 142 60% 45%; /* Earthy Green */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Mode (Sleek & Deep) */
    --bg-primary: 220 20% 8%; /* Deep slate background */
    --bg-surface: 220 15% 12%; /* Slightly lighter slate for cards */
    --text-primary: 0 0% 98%; /* Near white */
    --text-secondary: 220 10% 65%; /* Muted gray */
  }
}
```
- **Usage:** These variables will be integrated directly into our Tailwind configuration (e.g., `bg-primary`, `text-brand`).

## 3. Design System & Components

### 3.1 Glassmorphism & Depth
- **Navigation & Modals:** The top navigation bar and sticky chat interface will utilize backdrop filters (`backdrop-blur-md`) with semi-transparent backgrounds to create a frosted glass effect over recipe grids.
- **Shadows:** Soft, colored drop shadows will be used on interactive elements instead of harsh grey shadows (e.g., an orange glow behind the primary CTA).

### 3.2 Recipe Cards (Grid)
- **Image:** Full-width, high-quality recipe image on top.
- **Content:** Title (`Outfit` font), prep time, and pill-shaped tags for Region, Meal Type, and Occasion.
- **Interaction:** On hover, the image scales slightly (`scale-105`), and a subtle gradient overlay appears with a quick "Save" icon.

### 3.3 Buttons
- **Primary:** Solid Spicing Orange background, rounded corners (`rounded-full`), white text.
- **Secondary:** Transparent background with a 1px solid border, or subtle frosted glass.
- **Interaction:** All buttons feature a subtle active scale-down (`active:scale-95`) and hover glow.

## 4. User Flow, Navigation & Key Pages

### 4.1 Overall User Flow & Permissions
- **The Funnel:** Users arrive at the **Landing Page (Catalogue)** -> They explore -> They click the primary Call to Action (CTA) to save a recipe or use advanced features -> This triggers the **Auth Flow (Sign up / Login)** -> Upon success, they land on their **Personal Dashboard**.
- **Guest Permissions (Non-Registered):** Guests can freely browse the catalogue and read all public recipes by clicking on any recipe card to view its **Recipe Detail Page**. They can interact with the AI Chatbot ("Chef Ada"), but their chat session is **ephemeral** (not saved to history). **Clicking "Save", "Export", or "Share" will trigger an Auth Guard**. Instead of a jarring page redirect, a beautiful **Login/Signup Modal** will appear seamlessly over the current page. They do not have access to a Dashboard.
- **Top Navbar:** Contains the logo (left), global search (center), and user controls (right).
  - *Logged out:* Shows "Log In" / "Sign Up" buttons.
  - *Logged in:* Shows a User Avatar. Clicking the avatar opens a dropdown menu containing:
    - **Dashboard**
    - **Profile Settings**
    - **Log Out**

### 4.2 Recipe Catalogue (Home / Landing Page)
- **Hero Section (Overlapping & Floating Elements):** Taking inspiration from modern editorial layouts, the hero will feature a large central visual (a featured dish or chef) with **floating stat cards** (e.g., "10k+ Recipes", "30% off") and **floating badges** overlapping the edges of the main image container to create depth.
- **Warm & Inviting Base:** We will use our `--bg-primary` variable (warm off-white in light mode) contrasting beautifully with our Spicy Orange primary color.
- **Catalogue Body (Sidebar & Asymmetric Grids):** The layout will break away from a basic grid by using a **Main Content + Sidebar** approach. The wider main column will house the recipe feed in a staggered masonry layout, while a narrower right sidebar will feature a vertical stack for "Top Rated this Week" or "Chef's Blog".
- **Container Styling:** Recipe cards and layout boxes will use generous border radii (`rounded-2xl` or `3xl`) combined with soft, diffused, color-tinted drop shadows (`shadow-orange-500/10`) to make elements feel like they are floating above the warm background.

### 4.3 User Dashboard & Profile
The Dashboard is the user's private hub, utilizing a clean, tabbed navigation menu on the left side (desktop) or a scrollable horizontal tab bar (mobile).

- **Tab 1: Saved Recipes (Collections)**
  - **Layout:** A clean masonry grid showing all recipes the user has bookmarked.
  - **Interaction:** Users can click a "Notes" icon on any saved card to write or edit their personal notes for that specific recipe (e.g., "Add extra salt next time"). A quick "Remove" button allows them to unsave it.
  
- **Tab 2: My Recipes (User Generated Content)**
  - **Layout:** Divided into two distinct sections: **Published** (visible to everyone) and **Private** (drafts or personal recipes).
  - **Create Button:** A prominent "Create New Recipe" button at the top. Clicking this opens a beautifully animated, multi-step modal or dedicated page to input Title, Ingredients, Steps, and upload an image.
  - **Card Actions:** On their own recipes, users see quick-action icons to Edit, Delete, or toggle Publish/Unpublish status instantly.

- **Tab 3: Profile Settings**
  - **Layout:** A simple, card-based form where users can update their username, profile image (avatar), and view their connected accounts (e.g., Google OAuth status).

### 4.4 Recipe Detail Page (Uniform Modal Flow)
To create a perfectly **uniform and seamless flow**, we will use Next.js Intercepting Routes (similar to how Instagram or Pinterest work).
- **The Flow:** When a user clicks a recipe card from the Landing Page or Dashboard, they *do not* navigate to a new page that breaks their context. Instead, the Recipe Detail opens as a **large, beautiful overlay modal** directly on top of the grid they were looking at. 
- **Available Actions:** Inside the recipe view, a user can:
  - **Read:** View the edge-to-edge cover photo, ingredients, steps, and nutrition (if public).
  - **Save:** Bookmark the recipe (requires login).
  - **Export to DOCX:** Download a beautifully formatted Word document (requires login).
  - **Share:** Copy the link or share directly to WhatsApp/X/Facebook.
  - **Edit/Delete/Publish:** Only visible if the user is the *owner* of the recipe.
- **Post-Login Continuity:** If they click "Save" inside this recipe modal, the smaller Auth Modal pops up. After they log in, the Auth Modal closes, the recipe saves, and they are *still* looking at the recipe over their feed. The context is never lost.
- **Direct Links:** If someone shares the recipe link and a user clicks it, it acts as a normal standalone page with an edge-to-edge cover image.
- **Layout:** Inside the modal, the layout is split on desktop (Ingredients stickied on left, Steps on right), and single-column on mobile.

### 4.5 AI Chatbot ("Chef Ada")
- **Global Access & Persistence:** Accessible from *anywhere* via a prominent **Floating Action Button (FAB)**. Because we are using Next.js App Router layouts, the chat drawer state and active conversation **persist seamlessly** across page navigation. The chat will not disappear or reset if a user clicks a link to view a recipe.
- **Context-Aware Memory:** If you open the drawer while viewing a Recipe Detail modal, Chef Ada receives the context of that exact recipe. You can say *"I don't have crayfish, what can I use instead for this?"* and she will know exactly which recipe you are looking at.
- **The Drawer:** Clicking the FAB slides out a sleek, glassmorphic drawer from the right edge of the screen.
- **Saved History & Memory (RAG):** The chat maintains full multi-turn memory. All conversations are saved to the database (`ChatHistory`) via a `session_id` (even for guests). If a user closes the drawer or returns later, their chat history is reloaded, and Chef Ada perfectly remembers the context of the conversation.
- **Chat Bubbles:** User messages in deep slate, Chef Ada's messages in subtle gradient or bordered glass blocks.
- **Inline Results:** When Ada recommends a recipe, it renders as a mini interactive Recipe Card directly within the chat stream.

## 5. Animations & Micro-interactions (Powered by Framer Motion)
- **Framer Motion Integration:** We will use `framer-motion` for fluid, physics-based animations that elevate the feel of the application.
- **Page Transitions:** Elegant fade-and-slide transitions between routes (e.g., smoothly animating from the masonry grid to the recipe detail page).
- **Staggered Reveals:** When the landing page or a new search result loads, recipe cards will animate in sequentially using a spring-based, staggered entrance animation.
- **Hover & Tap Effects:** Physics-based spring animations for button presses (`whileTap`), and image scale/parallax effects when hovering over recipe cards (`whileHover`).
- **Loading States:** Shimmering skeleton loaders that match the exact layout of the content being loaded, rather than generic spinners.

## User Review Required
> [!IMPORTANT]
> Please review this UI/UX Design Specification. Does this aesthetic direction (Vibrant accents, Dark mode emphasis, Glassmorphism, specific fonts) align with your vision for the app? 
