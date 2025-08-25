import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
type GeofenceAreaParams = {
    latitude: number;
    longitude: number;
    radius: number; // in meters
};

export const createGeofenceArea = (
     longitude: GeofenceAreaParams['longitude'],
    latitude: GeofenceAreaParams['latitude'],
    radius: GeofenceAreaParams['radius']
) => {
    if (
        typeof latitude !== 'number' || isNaN(latitude) ||
        typeof longitude !== 'number' || isNaN(longitude) ||
        typeof radius !== 'number' || isNaN(radius) || radius <= 0
    ) {
        throw new Error('Invalid parameters for geofence area');
    }

    if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
    }

    return {
        type: 'circle', 
        coordinates: [longitude, latitude],
        radius 
    };
};
export function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    console.log("Distance calculated:", distance);
    return distance;

    
}
 export async function checkIfInsideAnyFence(lat: number, lon: number) {
    const prisma = new PrismaClient();
    const geofences = await prisma.geoFenceArea.findMany({
        select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            radius: true

        }
    });

    const insideFences: { id: string; name: string; distance: number; lat: number; lon: number }[] = [];

    geofences.forEach(fence => {
        const distance = getDistanceFromLatLonInMeters(
            lat,
            lon,
            fence.latitude,
            fence.longitude
        );
        if (fence.radius !== null && distance <= fence.radius) {
            insideFences.push({ id: String(fence.id), name: fence.name, distance, lat, lon });
        }
        
    });
     console.log(insideFences);
    return insideFences;
}

