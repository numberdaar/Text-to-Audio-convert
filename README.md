<div align="center">

# 🎵 Text to Audio Converter

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18+-blue) ![OpenAI](https://img.shields.io/badge/OpenAI-TTS--1-purple) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

**A modern, full-stack web application that converts unlimited text to high-quality audio using OpenAI's TTS-1 model.**

Built with Node.js, Express, React, and MongoDB with a beautiful, responsive UI.

[🚀 Live Demo](#) • [📖 Documentation](#api-endpoints) • [🐛 Report Bug](#) • [💡 Request Feature](#)

</div>

---

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🎯 **No Text Limit** | Convert unlimited text to audio |
| 🎨 **Modern UI** | Beautiful, responsive design with Tailwind CSS |
| 🎤 **Multiple Voices** | Choose from 6 different AI voices |
| 🔊 **Real-time Preview** | Play audio directly in the browser |
| 📥 **Download Support** | Download generated audio files |
| 📱 **Mobile Responsive** | Works perfectly on all devices |
| ⚡ **Fast Conversion** | Powered by OpenAI's latest TTS technology |
| 📊 **Statistics** | View conversion stats and character count |
| 🗄️ **Database Storage** | MongoDB Atlas for data persistence |
| 🔒 **Secure** | Environment variables and rate limiting |

</div>

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Backend** | Node.js, Express.js |
| **Frontend** | React.js, Vite |
| **AI Service** | OpenAI TTS-1 |
| **Database** | MongoDB Atlas |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Package Manager** | npm |

</div>

## 📋 Prerequisites

- ✅ Node.js (v16 or higher)
- ✅ npm or yarn
- ✅ OpenAI API key (paid account required)
- ✅ MongoDB Atlas account (or local MongoDB)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd texttoaudio
```

### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run setup
```

### 3. Configure Environment Variables
Create or update `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/texttoaudio
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 4. Run the Application

#### Development Mode
```bash
# Start both frontend and backend
npm run dev
```

#### Production Mode
```bash
# Build the React app
npm run build

# Start production server
cd server && npm start
```

### 5. Access the Application
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000
- 💚 **Health Check**: http://localhost:5000/api/health

## Running the Application

### Development Mode

Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd server
   npm start
   ```

## API Endpoints

### Audio Conversion
- `GET /api/audio/voices` - Get available voices
- `POST /api/audio/convert` - Convert text to audio
- `GET /api/audio/:filename` - Download audio file

### History Management
- `GET /api/history` - Get conversion history
- `GET /api/history/stats` - Get usage statistics
- `DELETE /api/history/:id` - Delete specific conversion
- `DELETE /api/history` - Clear all history

## Voice Options

| Voice | Description | Best For |
|-------|-------------|----------|
| **Alloy** | Clear and professional | Business presentations, formal content |
| **Echo** | Warm and friendly | Customer service, casual content |
| **Fable** | Storytelling voice | Narratives, stories, creative content |
| **Onyx** | Deep and authoritative | News, announcements, serious content |
| **Nova** | Bright and energetic | Marketing, promotional content |
| **Shimmer** | Soft and melodic | Relaxing content, meditation |

## Project Structure

```
texttoaudio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # MongoDB models
│   ├── public/             # Static files
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Usage

1. **Navigate to the application** at http://localhost:3000
2. **Enter your text** in the text area (max 4000 characters)
3. **Select a voice** from the available options
4. **Click "Convert to Audio"** to generate speech
5. **Play, download, or share** your audio file
6. **View history** to manage past conversions
7. **Check statistics** to see your usage analytics

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/texttoaudio |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `NODE_ENV` | Environment mode | development |

### Customization

- **Voice Options**: Modify the `AVAILABLE_VOICES` array in `server/routes/audio.js`
- **Styling**: Customize Tailwind classes in `client/src/index.css`
- **Rate Limiting**: Adjust limits in `server/index.js`

## Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS** configuration
- **Environment variable** protection

## Performance Optimizations

- **Compression** middleware for faster responses
- **MongoDB indexing** for better query performance
- **File cleanup** for audio files
- **Lazy loading** for React components

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `.env`

2. **OpenAI API Error**
   - Verify your API key is correct
   - Check your OpenAI account balance

3. **Port Already in Use**
   - Change the port in `.env` file
   - Kill processes using the port

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## Acknowledgments

- OpenAI for providing the TTS API
- React and Vite teams for the excellent development tools
- Tailwind CSS for the utility-first CSS framework