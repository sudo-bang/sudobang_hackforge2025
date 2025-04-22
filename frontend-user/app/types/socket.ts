export type Role = "ambulance" | "hospital";

export interface RegisterPayload {
    id: string;
    role: Role;
}

export interface StatusUpdatePayload {
    requestId: string;
    status: string;
    data: any;
}

export interface LocationUpdatePayload {
    requestId: string;
    coordinates: { lat: number; lng: number };
}