# Mess Menu Upload System

A Next.js application that allows users to upload Excel files containing mess menu data and store it in MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas account)

## Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd excel-to-json
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory with the following content:
```
MONGODB_URI=your_mongodb_connection_string
```
Replace `your_mongodb_connection_string` with your MongoDB connection URL.

## Running the Application

1. **Start the development server**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

2. **Build for production**
```bash
npm run build
```

3. **Start production server**
```bash
npm start
```

## Using the Application

1. **Upload Excel File**
   - Click the "Choose File" button
   - Select an Excel file (.xlsx) containing mess menu data
   - Click "Upload Menu"

2. **Excel File Format**
   Your Excel file should follow this format:
   | Day | Meal Type | Menu Items |
   |-----|-----------|------------|
   | Monday | Breakfast | Item1, Item2, ... |
   | Monday | Lunch | Item1, Item2, ... |
   etc.

3. **View Results**
   - After successful upload, you'll see a success message
   - The data will be stored in MongoDB

## Project Structure

```
excel-to-json/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts    # API endpoint for file upload
│   │   ├── page.tsx            # Main upload page
│   │   └── layout.tsx          # Root layout
│   ├── lib/
│   │   └── mongodb.ts          # MongoDB connection setup
│   ├── models/
│   │   └── Menu.ts             # MongoDB schema
│   ├── public/                 # Static files
│   └── package.json           # Project dependencies
├── README.md
└── .env
```

## API Endpoints

### POST /api/upload
- Accepts multipart form data with an Excel file
- Processes the file and stores menu data in MongoDB
- Returns success/error message

## Error Handling

The application handles various error cases:
- Invalid file format
- Missing file
- Database connection issues
- Invalid data format

## Development

To contribute to this project:
1. Create a new branch
2. Make your changes
3. Submit a pull request

## Troubleshooting

Common issues and solutions:

1. **MongoDB Connection Issues**
   - Check if MongoDB is running
   - Verify connection string in .env file
   - Ensure network connectivity

2. **File Upload Errors**
   - Check file format (must be .xlsx)
   - Verify file structure matches expected format
   - Check file size (should be reasonable)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers.
