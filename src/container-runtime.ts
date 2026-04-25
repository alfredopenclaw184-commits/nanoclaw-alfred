/**
 * Container runtime abstraction for NanoClaw.
 * Apple Container runtime version.
 */
import { execSync } from 'child_process';

import { log } from './log.js';

/** The container runtime binary name. */
export const CONTAINER_RUNTIME_BIN = 'container';

/** CLI args needed for the container to resolve the host gateway. */
export function hostGatewayArgs(): string[] {
  return [];
}

/** Returns CLI args for a readonly bind mount. */
export function readonlyMountArgs(hostPath: string, containerPath: string): string[] {
  return ['--mount', `type=bind,source=${hostPath},target=${containerPath},readonly`];
}

/** Stop a container by name. */
export function stopContainer(name: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) {
    throw new Error(`Invalid container name: ${name}`);
  }
  execSync(`${CONTAINER_RUNTIME_BIN} stop ${name}`, { stdio: 'pipe' });
}

/** Ensure the container runtime is running, starting it if needed. */
export function ensureContainerRuntimeRunning(): void {
  try {
    execSync(`${CONTAINER_RUNTIME_BIN} system status`, {
      stdio: 'pipe',
      timeout: 10000,
    });
    log.debug('Apple Container runtime already running');
  } catch (err) {
    log.warn('Apple Container runtime not running; attempting start', { err });
    try {
      execSync(`${CONTAINER_RUNTIME_BIN} system start`, {
        stdio: 'pipe',
        timeout: 30000,
      });
      log.info('Apple Container runtime started');
    } catch (startErr) {
      log.error('Failed to start Apple Container runtime', { err: startErr });
      console.error('\nFATAL: Apple Container runtime failed to start');
      console.error('Run: container system start');
      throw new Error('Container runtime is required but failed to start', {
        cause: startErr,
      });
    }
  }
}

/** Kill orphaned NanoClaw containers from previous runs. */
export function cleanupOrphans(): void {
  try {
    const output = execSync(`${CONTAINER_RUNTIME_BIN} list --format json`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });

    const parsed = JSON.parse(output || '[]');
    const rows = Array.isArray(parsed) ? parsed : [];

    const orphans = rows
      .map((c: any) => c?.configuration?.id || c?.id || c?.name || '')
      .filter((name: string) => name.startsWith('nanoclaw-') || name.startsWith('nanoclaw-v2-'));

    for (const name of orphans) {
      try {
        stopContainer(name);
      } catch {
        /* already stopped */
      }
    }

    if (orphans.length > 0) {
      log.info('Stopped orphaned containers', { count: orphans.length, names: orphans });
    }
  } catch (err) {
    log.warn('Failed to clean up orphaned containers', { err });
  }
}
