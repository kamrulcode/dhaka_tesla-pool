import {PassengerDashboard} from '@/components/passenger-dashboard';import {getSession} from '@/lib/auth';import {redirect} from 'next/navigation';
export default async function Passenger(){const s=await getSession();if(!s)redirect('/login');if(s.role!=='passenger')redirect('/driver');return <PassengerDashboard name={s.name}/>}
