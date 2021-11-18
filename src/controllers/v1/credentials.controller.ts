import { Request, Response } from 'express';

import * as yachtScoringJob from '../../jobs/yachtScoringJob';
import { externalServiceSources } from '../../models/syrf-schema/enums';
import { ValidYachtScoringJobType } from '../../types/YachtScoring-Type';

export async function addCredentials(
  req: Request<
    unknown,
    unknown,
    { userProfileId: string; source: string; user: string; password: string }
  >,
  res: Response,
) {
  const { userProfileId, source, user, password } = req.body;
  let isSuccessful = false;
  switch (source) {
    case externalServiceSources.yachtscoring:
      const theJob = await yachtScoringJob.addJob({
        type: ValidYachtScoringJobType.testCredentials,
        userProfileId,
        user,
        password,
      });
      isSuccessful = await theJob.finished();
      break;
  }

  res.status(200).json({ isSuccessful });
}

export default { addCredentials };
