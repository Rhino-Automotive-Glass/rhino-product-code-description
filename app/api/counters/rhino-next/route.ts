import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

/**
 * GET /api/counters/rhino-next
 *
 * Gets the next available Rhino auto-number.
 * This atomically increments the counter and returns the new value.
 *
 * Returns:
 * {
 *   "number": "00001",  // Formatted 5-digit string
 *   "rawValue": 1       // Raw integer value
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Call the database function to get next number atomically
    // This handles all concurrency and locking at the database level
    const { data, error } = await supabase.rpc('get_next_rhino_number');

    if (error) {
      console.error('Error getting next Rhino number:', error);
      return NextResponse.json(
        { error: 'Failed to get next Rhino number', details: error.message },
        { status: 500 }
      );
    }

    // Data is returned as a number (e.g., 1, 2, 3, etc.)
    const rawValue = data as number;

    // Format as 5-digit string with leading zeros
    const formattedNumber = rawValue.toString().padStart(5, '0');

    return NextResponse.json({
      number: formattedNumber,
      rawValue: rawValue,
    });
  } catch (error) {
    console.error('Unexpected error in rhino-next endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
