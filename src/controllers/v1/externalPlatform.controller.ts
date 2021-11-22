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

export async function getEvents(
  req: Request<unknown, unknown, { id: string; source: string }>,
  res: Response,
) {
  const { id, source } = req.body;
  let result = {
    isSuccessful: false,
    message: '',
    events: [],
  };
  switch (source) {
    case externalServiceSources.yachtscoring:
      const theJob = await yachtScoringJob.addJob({
        type: ValidYachtScoringJobType.getEvents,
        id,
      });
      result = await theJob.finished();
      break;
  }

  res.status(200).json(result);
}

export async function importEventData(
  req: Request<
    unknown,
    unknown,
    {
      credentialId: string;
      externalEventId: string;
      calendarEventId: string;
      source: string;
    }
  >,
  res: Response,
) {
  const { credentialId, externalEventId, source, calendarEventId } = req.body;

  switch (source) {
    case externalServiceSources.yachtscoring:
      await yachtScoringJob.addJob({
        type: ValidYachtScoringJobType.importEventData,
        credentialId,
        ysEventId: externalEventId,
        calendarEventId,
      });
      break;
  }

  res.status(200).json({ message: 'Job has been queued' });
}

export default { addCredentials, getEvents, importEventData };
