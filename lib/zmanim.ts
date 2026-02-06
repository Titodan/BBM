import { GeoLocation, ZmanimCalendar } from 'kosher-zmanim';

/**
 * Get the next Friday's date from today
 */
function getNextFriday(): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilFriday = (5 - currentDay + 7) % 7;
  
  // If today is Friday, use today
  const nextFriday = new Date(today);
  if (daysUntilFriday === 0) {
    return nextFriday;
  }
  
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  return nextFriday;
}

/**
 * Calculate Mincha time for Friday (15 minutes before shkiya) in London
 */
export function getFridayMinchaTime(): string {
  try {
    // London coordinates
    const location = new GeoLocation(
      'London',
      51.5074, // latitude
      -0.1278, // longitude
      0, // elevation (meters)
      'Europe/London'
    );

    const nextFriday = getNextFriday();
    const calendar = new ZmanimCalendar(location);
    calendar.setDate(nextFriday);

    // Get shkiya (sunset) time
    let shkiya = calendar.getSunset();
    
    if (!shkiya) {
      shkiya = calendar.getSeaLevelSunset();
    }
    
    if (!shkiya) {
      return '4:30 PM'; // Fallback time
    }

    // Handle Luxon DateTime object (from kosher-zmanim) or native Date
    let shkiyaTime: number;
    if (shkiya && typeof shkiya === 'object' && 'ts' in shkiya) {
      // Luxon DateTime object
      shkiyaTime = (shkiya as any).ts;
    } else if (typeof shkiya === 'number') {
      shkiyaTime = shkiya;
    } else if (shkiya instanceof Date) {
      shkiyaTime = shkiya.getTime();
    } else if (shkiya && typeof shkiya === 'object' && 'getTime' in shkiya) {
      shkiyaTime = (shkiya as any).getTime();
    } else {
      return '4:30 PM'; // Fallback time
    }

    // Subtract 15 minutes
    const minchaTime = new Date(shkiyaTime - 15 * 60 * 1000);

    // Format time as "H:MM PM/AM"
    const hours = minchaTime.getHours();
    const minutes = minchaTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    console.error('Error calculating Friday Mincha time:', error);
    return '4:30 PM'; // Fallback time
  }
}

/**
 * Calculate Arvit time for Friday (15 minutes after Mincha)
 */
export function getFridayArvitTime(): string {
  try {
    // London coordinates
    const location = new GeoLocation(
      'London',
      51.5074, // latitude
      -0.1278, // longitude
      0, // elevation (meters)
      'Europe/London'
    );

    const nextFriday = getNextFriday();
    const calendar = new ZmanimCalendar(location);
    calendar.setDate(nextFriday);

    // Get shkiya (sunset) time
    let shkiya = calendar.getSunset();
    
    if (!shkiya) {
      shkiya = calendar.getSeaLevelSunset();
    }
    
    if (!shkiya) {
      return '5:15 PM'; // Fallback time
    }

    // Handle Luxon DateTime object (from kosher-zmanim) or native Date
    let shkiyaTime: number;
    if (shkiya && typeof shkiya === 'object' && 'ts' in shkiya) {
      // Luxon DateTime object
      shkiyaTime = (shkiya as any).ts;
    } else if (typeof shkiya === 'number') {
      shkiyaTime = shkiya;
    } else if (shkiya instanceof Date) {
      shkiyaTime = shkiya.getTime();
    } else if (shkiya && typeof shkiya === 'object' && 'getTime' in shkiya) {
      shkiyaTime = (shkiya as any).getTime();
    } else {
      return '5:15 PM'; // Fallback time
    }

    // Arvit is at shkiya (no offset)
    const arvitTime = new Date(shkiyaTime);

    // Format time as "H:MM PM/AM"
    const hours = arvitTime.getHours();
    const minutes = arvitTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    console.error('Error calculating Friday Arvit time:', error);
    return '5:15 PM'; // Fallback time
  }
}
