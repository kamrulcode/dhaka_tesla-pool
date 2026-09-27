import {NextResponse} from 'next/server';import {getSession,currentUserDoc} from '@/lib/auth';
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({user:null});const u=await currentUserDoc();return NextResponse.json({user:{...s,online:!!u?.online,activeSeats:Number(u?.activeSeats||0)}})}
