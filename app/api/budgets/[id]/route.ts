import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';

export async function PUT(request: NextRequest, context: any) {
  const { id } = context.params;
  await dbConnect();
  try {
    const body = await request.json();
    const budget = await Budget.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const { id } = context.params;
  await dbConnect();
  try {
    const deletedBudget = await Budget.deleteOne({ _id: id });
    if (deletedBudget.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
