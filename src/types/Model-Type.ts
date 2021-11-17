import { Model } from 'sequelize';

export type GeometryPolygon = {
  crs: {
    type: 'name';
    properties: { name: 'EPSG:4326' };
  };
  type: 'Polygon';
  coordinates: number[][][];
};

export type GeometryPoint = {
  crs: {
    type: 'name';
    properties: { name: 'EPSG:4326' };
  };
  type: 'Point';
  coordinates: number[];
};

export interface CalendarEventInterface extends Model {
  id: string;
  name: string;
  locationName?: string;
  lon?: number;
  lat?: number;
  externalUrl?: string;
  startDay: number;
  startMonth: number;
  startYear: number;
  approximateStartTime: number;
  endDay: number;
  endMonth: number;
  endYear: number;
  ics?: string;
  isPrivate?: boolean;
  approximateEndTime?: number;
}

export interface CompetitionUnitInterface extends Model {
  id: string;
  name: string;
  startTime: Date;
  approximateStart: Date;
  vesselParticipantGroupId: string;
  endTime?: Date;
  timeLimit?: Date;
  isCompleted: boolean;
  boundingBox?: GeometryPolygon;
  courseId?: string;
  calendarEventId?: string;
  description?: string;
  approximateStartLocation?: GeometryPoint;
  approximateEndLocation?: GeometryPoint;
  country?: string;
  city?: string;
  status?: string;
}
