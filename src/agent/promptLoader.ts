/**
 * Prompt Loader
 * Loads system instructions from external files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load system instructions from the merged prompt file
 * @returns System instructions string
 */
export function loadSystemInstructions(): string {
  try {
    const promptPath = path.join(__dirname, '../../prompt-merged.md');
    const instructions = fs.readFileSync(promptPath, 'utf-8');

    console.log(`✅ Loaded system instructions from ${promptPath}`);
    return instructions;
  } catch (error) {
    console.error('❌ Error loading system instructions:', error);
    throw new Error('Failed to load system instructions. Please ensure prompt-merged.md exists.');
  }
}

/**
 * Load restaurant profile from JSON
 * @returns Restaurant profile object
 */
export function loadRestaurantProfile(): any {
  try {
    const profilePath = path.join(__dirname, '../../config/restaurant.profile.json');
    const profileData = fs.readFileSync(profilePath, 'utf-8');
    const profile = JSON.parse(profileData);

    console.log(`✅ Loaded restaurant profile for: ${profile.name}`);
    return profile;
  } catch (error) {
    console.error('❌ Error loading restaurant profile:', error);
    throw new Error('Failed to load restaurant profile. Please ensure config/restaurant.profile.json exists.');
  }
}
