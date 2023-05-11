// eslint-disable-next-line import/no-extraneous-dependencies
import Bee from "bee-queue";
import DummyJob from "../apps/jobs/DummyJob";
import WelcomeEmailJob from "../apps/jobs/WelcomeEmailJob";

import redisConfig from "../config/redis";

const jobs = [DummyJob, WelcomeEmailJob];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queue[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.on("failed", this.handleFail).process(handle);
    });
  }

  handleFail(job, error) {
    console.error(`Queue ${job.queue.name}: FAILED`, error);
  }
}

export default new Queue();
