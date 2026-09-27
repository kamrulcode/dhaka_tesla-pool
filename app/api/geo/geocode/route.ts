import {NextResponse} from 'next/server';

// Reliable MVP fallback for common Dhaka locations. This means the demo still
// works even when the public geocoder is unavailable.
const DHAKA_LOCATIONS: Record<string, {lat:number; lon:number; displayName:string}> = {
  'dhanmondi': {lat:23.7461, lon:90.3742, displayName:'Dhanmondi, Dhaka, Bangladesh'},
  'gulshan': {lat:23.7925, lon:90.4078, displayName:'Gulshan, Dhaka, Bangladesh'},
  'gulshan 1': {lat:23.7806, lon:90.4160, displayName:'Gulshan 1, Dhaka, Bangladesh'},
  'gulshan 2': {lat:23.7937, lon:90.4147, displayName:'Gulshan 2, Dhaka, Bangladesh'},
  'banani': {lat:23.7936, lon:90.4043, displayName:'Banani, Dhaka, Bangladesh'},
  'uttara': {lat:23.8759, lon:90.3795, displayName:'Uttara, Dhaka, Bangladesh'},
  'mirpur': {lat:23.8223, lon:90.3654, displayName:'Mirpur, Dhaka, Bangladesh'},
  'mirpur 10': {lat:23.8069, lon:90.3687, displayName:'Mirpur 10, Dhaka, Bangladesh'},
  'mohammadpur': {lat:23.7679, lon:90.3588, displayName:'Mohammadpur, Dhaka, Bangladesh'},
  'farmgate': {lat:23.7578, lon:90.3897, displayName:'Farmgate, Dhaka, Bangladesh'},
  'motijheel': {lat:23.7330, lon:90.4172, displayName:'Motijheel, Dhaka, Bangladesh'},
  'badda': {lat:23.7806, lon:90.4255, displayName:'Badda, Dhaka, Bangladesh'},
  'bashundhara': {lat:23.8151, lon:90.4253, displayName:'Bashundhara Residential Area, Dhaka, Bangladesh'},
  'bashundhara r/a': {lat:23.8151, lon:90.4253, displayName:'Bashundhara Residential Area, Dhaka, Bangladesh'},
  'tegaong': {lat:23.7627, lon:90.3914, displayName:'Tejgaon, Dhaka, Bangladesh'},
  'tejgaon': {lat:23.7627, lon:90.3914, displayName:'Tejgaon, Dhaka, Bangladesh'},
  'shahbag': {lat:23.7389, lon:90.3967, displayName:'Shahbag, Dhaka, Bangladesh'},
  'dhaka university': {lat:23.7338, lon:90.3933, displayName:'University of Dhaka, Bangladesh'},
  'airport': {lat:23.8433, lon:90.3978, displayName:'Hazrat Shahjalal International Airport, Dhaka, Bangladesh'},
  'hazrat shahjalal international airport': {lat:23.8433, lon:90.3978, displayName:'Hazrat Shahjalal International Airport, Dhaka, Bangladesh'},
  'wari': {lat:23.7161, lon:90.4174, displayName:'Wari, Dhaka, Bangladesh'},
  'lalbagh': {lat:23.7199, lon:90.3880, displayName:'Lalbagh, Dhaka, Bangladesh'},
};

function fallback(q:string) {
  const normalized = q.toLowerCase().replace(/,\s*dhaka.*$/i,'').trim();
  return DHAKA_LOCATIONS[normalized] || DHAKA_LOCATIONS[q.toLowerCase().trim()];
}

export async function GET(req:Request){
  try {
    const q = new URL(req.url).searchParams.get('q')?.trim();
    if(!q) return NextResponse.json({error:'Location is required'},{status:400});

    // First try our known Dhaka demo locations. No external service required.
    const known = fallback(q);
    if(known) return NextResponse.json({...known, source:'demo-fallback'});

    // Public Nominatim is used only after the local fallback and only after
    // an explicit user action (the Calculate Route button). We do not use it
    // for autocomplete. The request is identified and country-restricted.
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format','jsonv2');
    url.searchParams.set('limit','1');
    url.searchParams.set('countrycodes','bd');
    url.searchParams.set('q',q.includes('Bangladesh') ? q : `${q}, Dhaka, Bangladesh`);
    const r = await fetch(url.toString(), {
      headers: {
        'User-Agent':'TeslaPoolMVP/1.0 (https://teslapool.local; contact: admin@teslapool.local)',
        'Accept':'application/json'
      },
      cache:'no-store'
    });
    if(!r.ok) return NextResponse.json({error:'Geocoding service unavailable. Try a common Dhaka area such as Dhanmondi, Gulshan, Banani or Uttara.'},{status:502});
    const data = await r.json();
    if(!data[0]) return NextResponse.json({error:'Location not found. Try adding Dhaka, Bangladesh.'},{status:404});
    return NextResponse.json({lat:Number(data[0].lat),lon:Number(data[0].lon),displayName:data[0].display_name,source:'nominatim'});
  } catch {
    return NextResponse.json({error:'Geocoding is temporarily unavailable. Try a supported Dhaka area such as Dhanmondi or Gulshan.'},{status:503});
  }
}
