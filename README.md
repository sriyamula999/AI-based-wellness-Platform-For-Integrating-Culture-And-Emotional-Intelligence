# PranaAI Integrated Wellness Platform

This workspace combines the `Major_Project` React experience with the Ayurveda RAG service and the Mandira Express/MongoDB service.

## Structure

- `Major_Project/`: shared React frontend and the Mandira Node.js backend
- `Ayurveda/Ayurveda - Copy/heritage_explorer/`: Flask app, Ayurveda FAISS retrieval, and Gemini answer generation
- `Major_Project/src/components/Ahara.jsx`: Ahara chat UI connected to `POST http://localhost:5001/api/ask`
- `Major_Project/src/components/Mandira.jsx`: temple learning and games connected to the Express API on port 5000
- `Major_Project/src/components/Dhyana.jsx`: emotion, raga, audio, and breathing experience in the shared frontend

## Technology stack and project overview

This project is a multi-service wellness and heritage platform designed to combine cultural learning, interactive temple exploration, and AI-assisted wellness guidance.

### 1. Frontend and user experience

- React 18 with Vite
- JavaScript / JSX for UI development
- React Router DOM for navigation between app sections
- Tailwind CSS for styling and responsive layout
- Lucide React icons for interface visuals
- HTML2Canvas for screenshot or visual capture features
- A shared frontend in `Major_Project/src` that connects to both the Ayurveda AI service and the Mandira backend

### 2. Backend and API layer

- Node.js + Express for the Mandira service
- MongoDB with Mongoose for data persistence and structured records
- CORS middleware for cross-origin requests
- dotenv for environment variable management
- REST API endpoints for temple data, user progress, and game interactions

### 3. Ayurveda / AI knowledge layer

- Python Flask application for the Ayurveda RAG system
- FAISS (faiss-cpu) for vector similarity search over curated knowledge bases
- sentence-transformers for embedding generation and semantic retrieval
- langchain-text-splitters for document chunking and processing
- PyMuPDF for PDF text extraction
- Flask-Login and Flask-SQLAlchemy for handling user session and application data needs
- Google Generative AI integration for answer generation and conversational summaries
- dotenv for managing API keys and configuration such as `GOOGLE_API_KEY`

### 4. Data and knowledge management

- Structured text, extracted text, cleaned text, and refined text pipelines under the Ayurveda data folders
- Vector database and knowledge sources organized by domain such as herbs, doshas, lifestyle, seasons, food, symptoms, and Ayurvedic principles
- Retrieval-Augmented Generation (RAG) architecture for grounding responses in source documents before generating final answers

### 5. Tools and development ecosystem

- npm for the frontend and Node backend dependency management
- Python package installation via `requirements.txt` for the Ayurveda service
- Vite as the frontend build and dev server
- PostCSS and Autoprefixer with Tailwind for CSS processing and vendor prefixing
- Environment-based configuration files (`.env`) for the Flask app, frontend, and backend

### 6. Application purpose

The platform combines several experiences in one product:

- `Mandira`: temple heritage learning, maps, and interactive content
- `Ahara`: diet and wellness Q&A powered by retrieval from Ayurvedic knowledge
- `Dhyana`: meditation, breathing, and mood-focused experiences
- `DynastyGame`, `TemplePuzzle`, and other components for educational engagement

### 7. Key technologies summary

- Frontend: React, Vite, Tailwind CSS, React Router, Lucide
- Backend: Node.js, Express, MongoDB, Mongoose
- AI / RAG: Python, Flask, FAISS, sentence-transformers, Google Gemini, LangChain text splitters
- Data processing: PyMuPDF, custom cleaning and extraction scripts
- Dev tooling: npm, Python virtual environment, dotenv, PostCSS, Autoprefixer

## Component-wise architecture and data flow

### Frontend app shell

The React app is bootstrapped in `Major_Project/src/App.jsx` and uses `react-router-dom` to manage pages such as `/`, `/ahara`, `/mandira`, `/dhyana`, and `/profile`. The layout is controlled by `Navbar.jsx`, and the whole experience is styled using Tailwind CSS classes. This makes the application a single-page React frontend with multiple experience modules rather than separate full apps.

### Home / landing experience

`Major_Project/src/components/Home.jsx` acts as the dashboard and landing page. It presents the overall platform identity and navigational entry points to the different wellness experiences: Ahara, Mandira, and Dhyana. It relies on standard React state and component composition with Tailwind for visual structure and card layouts.

### Ahara module

`Major_Project/src/components/Ahara.jsx` is the AI wellness and diet assistant. It is a React-based chat interface that sends user prompts to the Python Flask RAG service on `http://localhost:5001/api/ask` and displays the returned answer along with retrieved sources. It uses the API endpoint from the frontend config file under `Major_Project/src/config/api.js` and is designed around the retrieval-augmented generation model. The actual knowledge base is stored under the Ayurveda folders such as `knowledge/foods`, `knowledge/herbs`, `knowledge/doshas`, `knowledge/symptoms`, and other Ayurveda domain documents.

### Mandira module

`Major_Project/src/components/Mandira.jsx` is the largest heritage module. It does the following:

- Fetches the monument list from the Node/Express backend using `GET /api/mandira/temples`
- Shows temple cards in sequence, gating unlock progression based on prior temple completion
- Loads flashcards after the image puzzle for a temple is completed
- Tracks progress using `POST /api/mandira/progress`
- Unlocks a final reward/secret after all cards are completed
- Uses `html2canvas` to allow users to download a reward image or themed heritage result

This module is the main place where the frontend interacts with MongoDB-backed temple records. It is built using React state, effect hooks, fetch calls, and custom unlock logic.

### Dhyana module

`Major_Project/src/components/Dhyana.jsx` focuses on emotional wellness, breathing, raga audio, and meditative interaction. It is a frontend-only experience using React components and user-driven controls rather than a dedicated backend service. The design is centered on a self-care / mindfulness interface with interactive emotional and sound-based elements.

### Profile module

The profile area is implemented as a React profile view that reads the user identity from local storage (`pranaai_user_email`) and fetches user stats from the backend through `/api/user/profile/:userId`. This is used to show temple completion counts and collected card totals. The profile page is connected to the Mandira backend's progress tracking logic rather than separate storage.

### Temple data storage and structure

Temple content is stored in two layers:

1. Source data in JSON format
   - File: `Major_Project/mandira-backend/data/TemplesData.json`
   - Contains monument records like `templeId`, `name`, `location`, `masterImageUrl`, `totalCards`, `flashcards`, and `unknownSecret`
   - Each flashcard includes `id`, `order`, `category`, `title`, and `content`

2. MongoDB database model
   - File: `Major_Project/mandira-backend/models/Temple.js`
   - Schema includes:
     - `templeId` as unique identifier
     - `sequence` for ordering the temple list
     - `name`, `location`, `masterImageUrl`, `totalCards`
     - `flashcards` as an embedded array of flashcard objects
     - `unknownSecret` for the final reward content

The backend automatically seeds the database when it is empty:

- In `Major_Project/mandira-backend/server.js`, MongoDB is connected with `mongoose.connect(MONGO_URI)`
- The code checks `Temple.countDocuments()`
- If the collection is empty, it inserts all temple records from the JSON into the database
- It also updates `sequence` values so temples render in the correct order

This means the app can start with a static source dataset and then persist it into MongoDB for dynamic retrieval, unlocking, and progress tracking.

### User progress storage

User progression is stored separately from the temple content in the `UserProgress` model located in `Major_Project/mandira-backend/models/UserProgress.js`.

The tracked fields are designed for sequential unlocking and learning progression:

- `userId`
- `templeId`
- `completedCardIds`
- `puzzleCompleted`
- `isFullyUnlocked`

These values determine whether the user:

- has solved the monument puzzle,
- has completed all flashcards for a temple,
- can unlock the next temple/sequence challenge,
- can receive the final secret reward.

### API route structure

The API layer is in `Major_Project/mandira-backend/routes/mandiraRoutes.js` and controls temple access flow:

- `GET /api/mandira/temples` -> returns the list of temples, unlock status, and progress state
- `GET /api/mandira/:templeId/flashcards` -> returns cards only after puzzle completion
- `POST /api/mandira/:templeId/puzzle-complete` -> marks the puzzle as solved and enforces order
- `POST /api/mandira/progress` -> saves card completion data
- `GET /api/mandira/:templeId/reward/:userId` -> returns the final secret if all cards are completed

This logic enforces a game-like sequence: puzzle -> flashcards -> reward -> unlock next temple.

### Games and interactive learning modules

#### 1. Mandira timeline game

File: `Major_Project/src/components/MandiraGame.jsx`

Technology used:

- React state hooks
- JavaScript sorting and drag/move logic
- `lucide-react` icons
- layout and visual styling via Tailwind CSS

Gameplay:

- A historical event list is shuffled
- The user moves the items into chronological order
- Sequence is validated against the correct year progression
- The game signals completion when the timeline is correct

This is a pure frontend logic challenge, with no database required for the gameplay itself.

#### 2. Dynasty map game

File: `Major_Project/src/components/DynastyGame.jsx`

Technology used:

- React state management
- HTML5 drag-and-drop events
- custom map overlay layout
- remote India map image source for visual region placement
- Tailwind CSS for styling and zone containers

Gameplay:

- Monument cards are dragged onto the correct regional zones of India
- Each match is checked for correctness
- Score updates live as the user places monuments
- Completion is achieved when all monuments are mapped correctly

This game is also primarily frontend logic and UI, using region mapping rather than backend persistence.

#### 3. Temple image puzzle

File: `Major_Project/src/components/TemplePuzzle.jsx`

Technology used:

- React hooks and timers
- CSS background positioning to create a sliding tile mosaic
- simple puzzle verification logic
- Tailwind styling and icon feedback

Gameplay:

- The monument image is split into 3x3 tiles
- The tiles are shuffled and rearranged by selection
- User verifies the reconstruction before the hidden content or flashcards are unlocked

This acts as the gatekeeper for the temple learning pathway.

### Ayurveda data and AI retrieval

The Python side is in `Ayurveda/Ayurveda - Copy/` with the main app located under `heritage_explorer/` and knowledge under `knowledge/`.

The AI engine uses:

- Flask as the web API server
- FAISS for vector search
- sentence-transformers for embeddings
- PyMuPDF for extracting content from PDFs
- text preparation scripts for cleaning and refining knowledge data
- Google Generative AI for answer synthesis and follow-up generation

The knowledge categories are separated into domain folders such as:

- herbs
- doshas
- foods
- seasons
- lifestyle
- symptoms
- general ayurvedic principles

This creates a retrieval-augmented architecture where the app searches relevant knowledge first and then generates a grounded response.

### Overall architecture summary

This project is a full-stack wellness and heritage platform with three connected layers:

- React frontend with immersive educational modules and interactive games
- Express + MongoDB backend for structured learning data and progress tracking
- Python + Flask + FAISS AI service for Ayurvedic question answering and retrieval

Together they create a combined experience where users can:

- learn heritage through temple-based flashcards,
- unlock stories and secrets through game progression,
- explore AI-powered wellness guidance,
- and track user-specific learning progress over time.

## Run the merged system

Use three terminals from the workspace root.

### 1. Ayurveda RAG service

```powershell
Set-Location '.\Ayurveda\Ayurveda - Copy\heritage_explorer'
python -m pip install -r ..\requirements.txt
python app.py
```

The Flask service runs on `http://localhost:5001`. Copy `heritage_explorer/.env.example` to `heritage_explorer/.env` and set `GOOGLE_API_KEY` and a private `FLASK_SECRET_KEY`. You can optionally set `GEMINI_MODEL=gemini-2.0-flash`. Without a Google API key, Ahara still returns retrieved source excerpts instead of failing, but Gemini-generated summaries and follow-up questions are unavailable.

### 2. Mandira backend

```powershell
Set-Location '.\Major_Project\mandira-backend'
npm install
npm start
```

The Express service runs on `http://localhost:5000`. Set `MONGO_URI` in `mandira-backend/.env`.

### 3. Shared frontend

```powershell
Set-Location '.\Major_Project'
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend keeps both service URLs configurable through `VITE_RAG_API_URL` and `VITE_MANDIRA_API_URL`, so deployment does not require changing component code.
