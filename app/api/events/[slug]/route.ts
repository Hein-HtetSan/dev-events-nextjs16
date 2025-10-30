import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { IEvent } from '@/database';
import Event from '@/database/event.model';

type RouteParams = {
    params: Promise<{
        slug: string;
    }>
}

export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        await connectDB();

        const { slug } = await params;

        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing slug parameter' },
                { status: 400 }
            )
        }

        const sanitizedSlug = slug.trim().toLowerCase();

        const event = await Event.findOne({ slug: sanitizedSlug }).lean()

        if (!event) {
            return NextResponse.json(
                { message: `Event with slug ${sanitizedSlug} not found`},
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: 'Event fetched successfully', event },
            { status: 200 }
        )

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching event by slug:', error)
        }

        if (error instanceof Error) {
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { message: 'Failed to fetch event', error: error.message },
                { status: 500 }
            )
        }

        // Ensure a NextResponse is always returned to satisfy the function's return type
        return NextResponse.json(
            { message: 'Failed to fetch event' },
            { status: 500 }
        )
    }
}