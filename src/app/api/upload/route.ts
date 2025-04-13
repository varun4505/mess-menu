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
        // Parse the date string in DD-MM-YYYY format
        const date = parseDateString(dateStr);
        
        // Check if the date is valid
        if (!date || isNaN(date.getTime())) {
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
      },    }));    try {
      const result = await Menu.bulkWrite(operations);
      console.log('MongoDB operation result:', result);

      return NextResponse.json({
        message: 'Menu data uploaded successfully',
        count: menuItems.length,
      });
    } catch (error: unknown) {      const mongoError = error as { code?: number; message: string };
      if (mongoError.code === 11000) {
        console.error('Duplicate key error:', mongoError.message);
        
        // Handle duplicates by doing individual upserts with overwrite
        for (const item of menuItems) {
          await Menu.findOneAndUpdate(
            { date: item.date, day: item.day, mealType: item.mealType },
            item,
            { upsert: true, new: true }
          );
        }
        
        return NextResponse.json({
          message: 'Menu data uploaded successfully (with duplicate resolution)',
          count: menuItems.length,
        });
      }
      
      throw error;  // Rethrow if it's not a duplicate key error
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Parse a date string in various formats including DD-MM-YYYY
 * @param dateStr The date string to parse
 * @returns A Date object or null if parsing fails
 */
function parseDateString(dateStr: string): Date | null {
  // Handle Excel date serial numbers
  if (typeof dateStr === 'number') {
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
  }
  
  // Handle string date formats
  if (typeof dateStr === 'string') {
    // Try to parse as DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Fallback to standard date parsing
    return new Date(dateStr);
  }
  
  return null;
}