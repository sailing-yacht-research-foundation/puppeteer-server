import Bull from 'bull';

import * as ogJob from './openGraph';

exports.registerWorkers = (opts: Bull.QueueOptions) => {
  ogJob.setup(opts);
};
