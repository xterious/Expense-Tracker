import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  await dbConnect();
  try {
    const recentTransactions = await Transaction.find({})
      .sort({ date: -1 })
      .limit(3);
    
    return NextResponse.json({ success: true, data: recentTransactions });
  } catch {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
