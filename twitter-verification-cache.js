/**
 * Twitter Verification Cache
 * Reduces API calls by caching verification results
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_FILE = path.join(__dirname, '.twitter-verification-cache.json');
const CACHE_DURATION = 23 * 60 * 60 * 1000; // 23 hours (stay under 24h limit)

/**
 * Check if we have a recent valid verification
 * @returns {Promise<boolean>} True if cache is valid
 */
export async function hasRecentVerification() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    const cache = JSON.parse(data);
    
    const age = Date.now() - cache.timestamp;
    const isValid = age < CACHE_DURATION;
    
    if (isValid) {
      const hoursOld = Math.floor(age / (60 * 60 * 1000));
      const hoursLeft = Math.ceil((CACHE_DURATION - age) / (60 * 60 * 1000));
      console.log(`🔓 [CACHE] Using cached Twitter verification (${hoursOld}h old, ${hoursLeft}h remaining)`);
      console.log(`👤 [CACHE] User: @${cache.username} (${cache.name})`);
    } else {
      console.log(`⏰ [CACHE] Verification cache expired (${Math.floor(age / (60 * 60 * 1000))}h old)`);
    }
    
    return isValid;
  } catch (error) {
    // Cache doesn't exist or is invalid
    if (error.code !== 'ENOENT') {
      console.log('⚠️ [CACHE] Error reading cache:', error.message);
    }
    return false;
  }
}

/**
 * Get cached user data
 * @returns {Promise<object|null>} Cached user data or null
 */
export async function getCachedUserData() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    const cache = JSON.parse(data);
    
    const age = Date.now() - cache.timestamp;
    if (age < CACHE_DURATION) {
      return {
        username: cache.username,
        name: cache.name,
        id: cache.id
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Save verification result to cache
 * @param {object} userData - User data from Twitter API
 */
export async function saveVerification(userData) {
  try {
    const cache = {
      timestamp: Date.now(),
      username: userData.username,
      name: userData.name,
      id: userData.id
    };
    
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('💾 [CACHE] Verification cached for next 23 hours');
  } catch (error) {
    console.error('⚠️ [CACHE] Failed to save cache:', error.message);
  }
}

/**
 * Clear verification cache (force re-verification on next start)
 */
export async function clearCache() {
  try {
    await fs.unlink(CACHE_FILE);
    console.log('🗑️ [CACHE] Verification cache cleared');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('⚠️ [CACHE] Failed to clear cache:', error.message);
    }
  }
}
