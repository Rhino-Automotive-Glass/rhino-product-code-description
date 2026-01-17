import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

/**
 * GET /api/counters/rhino-preview
 *
 * Gets a PREVIEW of the next Rhino number WITHOUT incrementing the counter.
 * This is used when user selects "R - Rhino Automotive" to show what number
 * will be assigned, but the actual reservation happens only when saving to database.
 *
 * Returns:
 * {
 *   "number": "00001",  // Formatted 5-digit string (preview)
 *   "rawValue": 1       // Raw integer value (preview)
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Call the database function to get CURRENT value (no increment)
    const { data, error } = await supabase.rpc('get_current_rhino_number');

    if (error) {
      console.error('Error getting Rhino number preview:', error);
      return NextResponse.json(
        { error: 'Failed to get Rhino number preview', details: error.message },
        { status: 500 }
      );
    }

    // Data is the current counter value (e.g., 0, 1, 2, etc.)
    const currentValue = data as number;

    // Preview is current + 1 (what the NEXT number will be)
    const previewValue = currentValue + 1;

    // Format as 5-digit string with leading zeros
    const formattedNumber = previewValue.toString().padStart(5, '0');

    return NextResponse.json({
      number: formattedNumber,
      rawValue: previewValue,
      isPreview: true, // Flag to indicate this is just a preview
    });
  } catch (error) {
    console.error('Unexpected error in rhino-preview endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
