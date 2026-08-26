#!/usr/bin/env node
/* eslint-disable no-undef */
// fallow-ignore-file
/**
 * Tenant rollout script — pulls a tagged GHCR image, runs migrations,
 * and performs a health check for a single tenant instance.
 *
 * Usage:
 *   npx tsx deploy/rollout.ts <slug> [--tag <tag>] [--dry-run]
 *
 * Prerequisites:
 *   - Docker CLI available on host
 *   - instances.json configured with compose file + env file paths
 *   - GHCR image built and pushed (or local for dev)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Instance {
  slug: string;
  name: string;
  profile: string;
  domain: string;
  composeFile: string;
  envFile: string;
  status: string;
  deployedAt?: string;
}

interface InstancesRegistry {
  instances: Instance[];
}

function loadRegistry(): InstancesRegistry {
  const regPath = join(__dirname, 'instances.json');
  return JSON.parse(readFileSync(regPath, 'utf8'));
}

function findInstance(slug: string): Instance | undefined {
  return loadRegistry().instances.find((i) => i.slug === slug);
}

function run(cmd: string, cwd: string): string {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' }).trim();
}

function healthCheck(baseUrl: string): boolean {
  try {
    const result = run(`curl -sf ${baseUrl}/api/health`, '.');
    const json = JSON.parse(result);
    return json?.status === 'ok';
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args[0];
  if (!slug) {
    console.error('Usage: npx tsx deploy/rollout.ts <slug> [--tag <tag>] [--dry-run]');
    process.exit(1);
  }

  const tagIdx = args.indexOf('--tag');
  const tag = tagIdx !== -1 ? args[tagIdx + 1] : 'latest';
  const dryRun = args.includes('--dry-run');

  const instance = findInstance(slug);
  if (!instance) {
    console.error(`Instance "${slug}" not found in deploy/instances.json`);
    process.exit(1);
  }

  const instanceDir = join(__dirname, '..', slug);
  if (!existsSync(instanceDir)) {
    console.error(`Instance directory not found: ${instanceDir}`);
    console.error('For a new tenant, create the directory and docker-compose.yml first.');
    process.exit(1);
  }

  console.log(`\n=== Rollout: ${instance.name} (${slug}) ===`);
  console.log(`  Profile: ${instance.profile}`);
  console.log(`  Domain:  ${instance.domain}`);
  console.log(`  Image tag: ${tag}`);
  console.log(`  Dry run: ${dryRun}\n`);

  if (dryRun) {
    console.log('[dry-run] Would run:');
    console.log(`  1. docker compose -f ${instance.composeFile} pull`);
    console.log(`  2. docker compose -f ${instance.composeFile} up -d`);
    console.log(`  3. docker compose -f ${instance.composeFile} exec web npx prisma migrate deploy`);
    console.log(`  4. Health check at https://${instance.domain}/api/health`);
    console.log('\n[dry-run] Complete.');
    return;
  }

  // Step 1: Pull latest image
  console.log('Step 1: Pulling latest image...');
  run(`docker compose -f ${instance.composeFile} --env-file ${instance.envFile} pull`, instanceDir);

  // Step 2: Start/recreate services
  console.log('Step 2: Starting services...');
  run(`docker compose -f ${instance.composeFile} --env-file ${instance.envFile} up -d --force-recreate`, instanceDir);

  // Step 3: Run migrations
  console.log('Step 3: Running database migrations...');
  run(`docker compose -f ${instance.composeFile} --env-file ${instance.envFile} exec -T web npx prisma migrate deploy`, instanceDir);

  // Step 4: Health check
  console.log('Step 4: Health check...');
  const baseUrl = `https://${instance.domain}`;
  const healthy = healthCheck(baseUrl);
  if (healthy) {
    console.log(`  ✓ Health check passed for ${baseUrl}`);
  } else {
    console.error(`  ✗ Health check FAILED for ${baseUrl}`);
    console.error('  Check container logs: docker compose logs web --tail=50');
    process.exit(1);
  }

  // Step 5: Update registry
  console.log('Step 5: Updating registry...');
  const registry = loadRegistry();
  const inst = registry.instances.find((i) => i.slug === slug);
  if (inst) {
    inst.deployedAt = new Date().toISOString().split('T')[0];
    inst.status = 'active';
    const regPath = join(__dirname, 'instances.json');
    const { writeFileSync } = await import('node:fs');
    writeFileSync(regPath, JSON.stringify(registry, null, 2) + '\n');
  }

  console.log(`\n=== Rollout complete: ${slug} ===\n`);
}

main().catch((err) => {
  console.error('Rollout failed:', err);
  process.exit(1);
});
