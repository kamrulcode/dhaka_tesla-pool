import {DriverDashboard} from '@/components/driver-dashboard';import {getSession} from '@/lib/auth';import {redirect} from 'next/navigation';
export default async function Driver(){const s=await getSession();if(!s)redirect('/login');if(s.role!=='driver')redirect('/passenger');return <DriverDashboard name={s.name}/>}
