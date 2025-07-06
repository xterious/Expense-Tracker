import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    const query = month ? { month } : {};
    const budgets = await Budget.find(query).sort({ month: -1, category: 1 });
    
    return NextResponse.json({ success: true, data: budgets });
  } catch {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const budget = await Budget.findOneAndUpdate(
      { month: body.month, category: body.category },
      { budgetAmount: body.budgetAmount },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, data: budget }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
