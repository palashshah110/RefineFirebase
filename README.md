# refine-firebase-providers

A custom data and auth provider using Firebase for Refine.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the package, run:

```sh
npm install refine-firebase-providers
```

## Usage
To use the data and auth providers in your project, import them and pass them to the Refine component:

```sh
import React from "react";
import { Refine } from "@refinedev/core";
import { authProvider, dataProvider } from "refine-firebase-providers";

const App = () => {
    return (
        <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
        />
    );
};

export default App;
```

## Configuration
To configure Firebase, you need to set your Firebase configuration in environment variables. Create a .env file in the root of your project and add your Firebase configuration:

```sh
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```
Make sure to load these environment variables in your firebaseconfig.ts file:

```sh
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.


This `README.md` will help users understand how to install, configure, and use your package effectively. Make sure to replace `refine-firebase-providers` with the actual package name you decide to use.
