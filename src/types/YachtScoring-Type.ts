export enum ValidYachtScoringJobType {
  testCredentials = 'test-credentials',
}

export type YachtScoringTestCredentialsData = {
  type: ValidYachtScoringJobType.testCredentials;
  userProfileId: string;
  user: string;
  password: string;
};

export type YachtScoringJobData = YachtScoringTestCredentialsData;

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
