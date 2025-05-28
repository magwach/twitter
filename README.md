**Twitter Clone**

A full-stack Twitter clone built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

_Features_

    User authentication and authorization
    
    Profile creation and editing
    
    Posting tweets with text and images
    
    Liking and unliking posts
    
    Following and unfollowing users
    
    Responsive design for mobile and desktop



_Technologies Used_

    Frontend: React.js, React Router, Tailwind CSS
    
    Backend: Node.js, Express.js
    
    Database: MongoDB
    
    Authentication: JWT (JSON Web Tokens)
    
    File Uploads: Cloudinary
    
    State Management: React Query

_Prerequisites_

    Node.js and npm installed
    
    MongoDB database (local or Atlas)
    
    Cloudinary account for image uploads

**Installation**

_Clone the repository:_

    git clone https://github.com/yourusername/twitter-clone.git
    cd twitter-clone

_Install dependencies:_

    npm install
    cd frontend
    npm install

_Set up environment variables:_

_Create a .env file in the root directory and add the following:_

    MONGO_URL=your_mongodb_connection_string
    PORT=5000
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    
_Run the application:_

    # In the root directory
    npm run dev
    This will start both the backend and frontend servers concurrently.

_Usage_

    Open your browser and navigate to http://localhost:5000 to access the application.
    
    Register a new account or log in with existing credentials.
    
    Create, like, and view posts.
    
    Edit your profile and upload images.

_Deployment_

The application is deployed and accessible at: https://twitter-9ofa.onrender.com/

_Contributing_

Contributions are welcome! Please fork the repository and submit a pull request.

_License_

This project is licensed under the MIT License.
