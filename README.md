# Smart AC Control System

A web-based control system for a smart air conditioning unit, built with Vue.js and Firebase.

## Features

- Real-time temperature monitoring
- Fan speed control
- Pump control
- Optimal mode for automated control
- User authentication
- Temperature logging and analysis
- Mobile-responsive design

## Tech Stack

- Vue 3 with Composition API
- Firebase Authentication
- Firebase Realtime Database
- Vite
- Chart.js for data visualization

## Environment Setup

1. Clone the repository
```bash
git clone [your-repo-url]
cd [your-project-directory]
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
- Copy `.env.example` to `.env.local`
- Fill in your Firebase configuration values

```bash
cp .env.example .env.local
```

## Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Realtime Database
3. Configure Authentication to allow email/password sign-in
4. Set up Realtime Database rules (see database.rules.json)
5. Add your web app to get configuration values

## Development

Run the development server:
```bash
npm run dev
```

## Deployment

This project is configured for deployment on Vercel.

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env.local`
4. Deploy!

### Manual Deployment

```bash
npm run build
vercel --prod
```

## Project Structure

```
src/
├── components/      # Reusable Vue components
├── composables/     # Composition API hooks
├── views/          # Page components
├── router/         # Vue Router configuration
├── assets/         # Static assets
└── style.css      # Global styles
```

## Security

- Firebase configuration is handled through environment variables
- Authentication state is managed securely
- Database rules enforce user-based access control

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License]
