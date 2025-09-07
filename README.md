# Campus Event Reporting Prototype

This is the repository for the Webknot campus drive campus event reporting app. I built this as a prototype to manage and track student events, and it was a great learning experience in setting up a modern, two-part application. It was tricky getting everything to talk to each other, but I'm satisfied with how it turned out.

### Project Overview

This app is split into a /frontend built with React and a /backend API powered by Node.js. The frontend is what you see in the browser, and it makes requests to the backend to get all the data. The backend handles all the logic, like connecting to the database and serving the information.

### Core Features

-   **Event Management**: You can create events with details like who is organizing it, where it's happening, and how many people can attend.
-   **Student Database**: The backend keeps a record of all students, linked to their respective colleges.
-   **Registration & Tracking**: Students can register for events, and their attendance can be tracked.
-   **Data Storage**: I'm using a local SQLite database, which makes it easy to work with without a lot of setup.

---

### Getting Started

Getting this app running involves the following steps:

#### Prerequisites
-   Node.js (LTS version 20.x is what was used)
-   npm

#### Installation & Running

1.  **Clone this repository** to your machine.

2.  **Set up the backend**:
    First, navigate to the `backend` folder and install all the necessary packages.

    ```bash
    cd campus-report/backend
    npm install
    ```

3.  **Seed the database**:
    Next, you need to populate the database with some initial data. This command creates the `campus-events.db` file.

    ```bash
    npm run seed
    ```

4.  **Set up the frontend**:
    Now, move to the `frontend` folder to install its dependencies.

    ```bash
    cd ../frontend
    npm install
    ```

5.  **Run the application**:
    You'll need two separate terminal windows for this, one for the backend and one for the frontend.

    **In Terminal 1 (Backend):**
    ```bash
    cd campus-report/backend
    npm run server
    ```

    **In Terminal 2 (Frontend):**
    ```bash
    cd campus-report/frontend
    npm start
    ```

You'll see the backend running on `localhost:3000`, and the frontend should pop up on `localhost:3001` to avoid a port conflict.

---

### File Structure

- The screenshots of AI prompts are in the /screenshots folder.
- The ER diagram is in the png format in the root of the project.
- The assumptions.md, api.md, and design.md are all in the root of the project as seperate design documentation files.