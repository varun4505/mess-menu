import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import connectDB from '../../../lib/mongodb';
import Menu from '../../../models/Menu';

interface MenuItem {
  date: Date;
  day: string;
  mealType: string;
  menuItems: string[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name);
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: 'No worksheet found in the Excel file' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Connected to MongoDB');

    const menuItems: MenuItem[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      console.log('Processing row:', rowNumber, row.values);

      const values = row.values as string[];
      const [dateStr, day, mealType, ...items] = values.slice(1); // Skip the first undefined element
      
      if (dateStr && day && mealType) {
        // Parse the date string to a Date object
        const date = new Date(dateStr);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date format in row ${rowNumber}: ${dateStr}`);
          return; // Skip this row if date is invalid
        }

        menuItems.push({
          date,
          day,
          mealType,
          menuItems: items.filter(item => item !== null && item !== undefined),
        });
      }
    });

    console.log('Processed menu items:', menuItems);

    if (menuItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid menu items found in the Excel file' },
        { status: 400 }
      );
    }

    // Use bulkWrite to handle both inserts and updates
    const operations = menuItems.map(item => ({
      updateOne: {
        filter: { date: item.date, day: item.day, mealType: item.mealType },
        update: { $set: item },
        upsert: true,
      },
    }));

    const result = await Menu.bulkWrite(operations);
    console.log('MongoDB operation result:', result);

    return NextResponse.json({
      message: 'Menu data uploaded successfully',
      count: menuItems.length,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
} 