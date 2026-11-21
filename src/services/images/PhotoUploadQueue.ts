import { KeyValueStore, userKeyPrefix } from '../../storage/keyValueStore';
import { ImageFolder } from './imageUpload';

export interface PendingPhotoTask {
  journalId: string;
  userId: string;
  localUris: string[];
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
}

export class PhotoUploadQueue {
  constructor(private readonly kv: KeyValueStore) {}

  private queueKey(userId: string): string {
    return `${userKeyPrefix(userId)}pending_photos_queue`;
  }

  async getQueue(userId: string): Promise<PendingPhotoTask[]> {
    const raw = await this.kv.getItem(this.queueKey(userId));
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async writeQueue(userId: string, tasks: PendingPhotoTask[]): Promise<void> {
    if (tasks.length === 0) {
      await this.kv.removeItem(this.queueKey(userId));
    } else {
      await this.kv.setItem(this.queueKey(userId), JSON.stringify(tasks));
    }
  }

  async enqueue(task: Omit<PendingPhotoTask, 'attempts' | 'enqueuedAt'>): Promise<void> {
    if (!task.localUris.length) return;
    const current = await this.getQueue(task.userId);
    const existingIdx = current.findIndex((t) => t.journalId === task.journalId);
    const fullTask: PendingPhotoTask = {
      ...task,
      attempts: 0,
      enqueuedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      current[existingIdx] = fullTask;
    } else {
      current.push(fullTask);
    }
    await this.writeQueue(task.userId, current);
  }

  async remove(userId: string, journalId: string): Promise<void> {
    const current = await this.getQueue(userId);
    const filtered = current.filter((t) => t.journalId !== journalId);
    await this.writeQueue(userId, filtered);
  }

  async clear(userId: string): Promise<void> {
    await this.kv.removeItem(this.queueKey(userId));
  }

  /**
   * Process all pending photo tasks for a user.
   * Uploads each local URI to storage, replaces them with cloud URLs on the journal,
   * and clears the task upon success.
   */
  async processQueue(
    userId: string,
    deps: {
      uploadPhoto: (uri: string, userId: string, folder: ImageFolder) => Promise<{ url: string }>;
      onJournalPhotosUploaded: (journalId: string, cloudUrls: string[]) => Promise<void>;
    }
  ): Promise<{ processed: number; failed: number }> {
    const queue = await this.getQueue(userId);
    if (!queue.length) return { processed: 0, failed: 0 };

    let processed = 0;
    let failed = 0;
    const remaining: PendingPhotoTask[] = [];

    for (const task of queue) {
      const uploadedUrls: string[] = [];
      let taskFailed = false;

      for (const uri of task.localUris) {
        try {
          const res = await deps.uploadPhoto(uri, userId, 'journals');
          uploadedUrls.push(res.url);
        } catch (err) {
          task.attempts += 1;
          task.lastError = err instanceof Error ? err.message : String(err);
          taskFailed = true;
          break; // Stop uploading this task's photos on first failure
        }
      }

      if (taskFailed || uploadedUrls.length !== task.localUris.length) {
        failed += 1;
        remaining.push(task);
      } else {
        try {
          await deps.onJournalPhotosUploaded(task.journalId, uploadedUrls);
          processed += 1;
        } catch (updateErr) {
          task.attempts += 1;
          task.lastError = updateErr instanceof Error ? updateErr.message : String(updateErr);
          failed += 1;
          remaining.push(task);
        }
      }
    }

    await this.writeQueue(userId, remaining);
    return { processed, failed };
  }
}
