import { NextResponse } from 'next/server';

// The function must be named after the HTTP method (GET, POST, etc.)
export async function GET(request, { params }) {
  // 1. In the App Router, the dynamic part comes from the `params` object.
  const { unitId } = params;

  // 2. Define the URL of the real, external API
  const externalApiUrl = `https://alchemquest.online/questions/unit/${unitId}`;

  try {
    // 3. Make a request from your server to the external API
    const apiResponse = await fetch(externalApiUrl);

    if (!apiResponse.ok) {
      console.error(`Error from external API: ${apiResponse.statusText}`);
      // Return an error response using NextResponse
      return NextResponse.json(
        { message: 'Failed to load question from external source.' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    // 4. Send the data back to your Unity game using NextResponse
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}