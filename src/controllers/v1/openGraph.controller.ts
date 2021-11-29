import { Request, Response } from 'express';

import * as ogJob from '../../jobs/openGraph';

export async function generateEvent(
  req: Request<
    unknown,
    unknown,
    {
      position: [number, number];
      calendarEventId: string;
    }
  >,
  res: Response,
) {
  const { calendarEventId, position } = req.body;
  ogJob.addJob({
    type: 'event',
    id: calendarEventId,
    position,
  });
  res.status(200).json({ message: 'Job has been queued' });
}

export async function generateCompetition(
  req: Request<
    unknown,
    unknown,
    {
      position: [number, number];
      competitionUnitIds: string[];
    }
  >,
  res: Response,
) {
  const { competitionUnitIds, position } = req.body;
  ogJob.addJob({
    type: 'competition-unit',
    idList: competitionUnitIds,
    position,
  });
  res.status(200).json({ message: 'Job has been queued' });
}

export default { generateEvent, generateCompetition };
