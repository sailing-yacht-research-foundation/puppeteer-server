export enum ValidYachtScoringJobType {
  testCredentials = 'test-credentials',
  getEvents = 'get-events',
  importEventData = 'import-event-data',
}

export type YachtScoringTestCredentialsData = {
  type: ValidYachtScoringJobType.testCredentials;
  userProfileId: string;
  user: string;
  password: string;
};

export type YachtScoringGetEventData = {
  type: ValidYachtScoringJobType.getEvents;
  id: string;
};

export type YachtScoringImportEventData = {
  type: ValidYachtScoringJobType.importEventData;
  credentialId: string;
  ysEventId: string;
};

export type YachtScoringJobData =
  | YachtScoringTestCredentialsData
  | YachtScoringGetEventData
  | YachtScoringImportEventData;

export type YachtScoringYachtCrew = {
  name: string;
  address: string;
  weight: string;
  dob: string;
  age: number;
  role?: string;
  wfIsafNo?: string;
  sailorClass?: string;
  usSailingNo?: string;
  classMember: string;
  phone?: string;
  cell?: string;
  email: string;
  waiver: boolean;
};

export type YachtScoringYacht = {
  id: string;
  circle: string;
  division: string;
  class: string;
  altClass: string;
  sailNumber: string;
  yachtName: string;
  ownerName: string;
  yachtType: string;
  length: number;
  origin: string;
  paid: boolean;
  crews: YachtScoringYachtCrew[];
};
