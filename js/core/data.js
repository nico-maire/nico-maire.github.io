// Loads every content file once and builds the lookup indexes used by the apps.
export const db = {};

const FILES = ['profile', 'projects', 'skills', 'knowledge', 'timeline', 'languages', 'scene'];

export async function loadData() {
  const results = await Promise.all(FILES.map(async (name) => {
    const res = await fetch(`data/${name}.json`);
    if (!res.ok) throw new Error(`data: cannot load ${name}`);
    return res.json();
  }));
  FILES.forEach((name, i) => { db[name] = results[i]; });

  db.projects.sort((a, b) => b.sort - a.sort);
  db.projectById = new Map(db.projects.map((p) => [p.id, p]));
  db.skillList = db.skills.skills;
  db.skillCats = db.skills.categories;
  db.skillById = new Map(db.skillList.map((s) => [s.id, s]));
  db.knowledgeById = new Map(db.knowledge.map((k) => [k.id, k]));

  db.projectsBySkill = new Map();
  for (const p of db.projects) {
    for (const s of p.skills) {
      if (!db.projectsBySkill.has(s)) db.projectsBySkill.set(s, []);
      db.projectsBySkill.get(s).push(p);
    }
  }
  return db;
}

export const PROJECT_CATEGORIES = ['startup', 'ai', 'security', 'systems', 'algorithms', 'iot', 'web', 'games'];

export function projectsIn(category) {
  return db.projects.filter((p) => p.categories.includes(category));
}
