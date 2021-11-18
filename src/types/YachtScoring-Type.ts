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
