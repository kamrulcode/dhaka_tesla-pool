import {NextResponse} from 'next/server';
import {haversineKm} from '@/lib/geo';

export async function GET(req:Request){
  try {
    const p=new URL(req.url).searchParams;
    const a=['fromLat','fromLon','toLat','toLon'].map(k=>Number(p.get(k)));
    if(a.some(v=>!Number.isFinite(v))) return NextResponse.json({error:'Invalid coordinates'},{status:400});
    const [fromLat,fromLon,toLat,toLon]=a;

    try {
      const url=`https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
      const r=await fetch(url,{
        headers:{'User-Agent':'TeslaPoolMVP/1.0 (https://teslapool.local)'},
        next:{revalidate:60}
      });
      if(r.ok){
        const data=await r.json(),route=data.routes?.[0];
        if(route) return NextResponse.json({distanceKm:route.distance/1000,durationMin:route.duration/60,geometry:route.geometry,source:'osrm'});
      }
    } catch {
      // Fall through to the deterministic local demo route below.
    }

    // Offline/demo fallback: calculate straight-line distance and draw a line.
    // This keeps the MVP usable if the public routing service is unavailable.
    const distanceKm=haversineKm({lat:fromLat,lon:fromLon},{lat:toLat,lon:toLon});
    return NextResponse.json({
      distanceKm,
      durationMin:distanceKm/25*60,
      geometry:{type:'LineString',coordinates:[[fromLon,fromLat],[toLon,toLat]]},
      source:'demo-fallback'
    });
  } catch {
    return NextResponse.json({error:'Could not calculate route'},{status:500});
  }
}
