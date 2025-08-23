import { NextResponse } from 'next/server';

// The function signature and logic remain the same.
export async function GET(request, context) {
  
  // THE FIX: Instead of destructuring {params} in the function signature,
  // we access it from the 'context' object directly.
  const unitId = context.params.unitId;

  // The rest of the code is identical
  const externalApiUrl = `https://alchemquest.online/questions/unit/${unitId}`;

  try {
    const apiResponse = await fetch(externalApiUrl);

    if (!apiResponse.ok) {
      console.error(`Error from external API: ${apiResponse.statusText}`);
      return NextResponse.json(
        { message: 'Failed to load question from external source.' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}