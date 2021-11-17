import Bull from 'bull';

import * as ogJob from './openGraph';

export const registerWorkers = (opts: Bull.QueueOptions) => {
  ogJob.setup(opts);
};
