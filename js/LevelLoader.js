/**
 * Level data access class.
 * Loads scene JSON files from disk using the project naming convention.
 */
class LevelLoader {
  // Load one level JSON from the conventional file naming scheme.
  async loadLevel(level) {
    const response = await fetch(`lvl${level}.json`);
    if (!response.ok) {
      throw new Error(`Unable to load level ${level}: ${response.status}`);
    }

    return response.json();
  }
}

window.LevelLoader = LevelLoader;
