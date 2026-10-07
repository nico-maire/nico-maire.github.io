// App registry: node.app -> factory(node, os, opts) returning a window spec.
import explorer from './explorer.js';
import project from './project.js';
import skill from './skill.js';
import knowledge from './knowledge.js';
import about from './about.js';
import { experience, education } from './timeline.js';
import languages from './languages.js';
import contact from './contact.js';
import cv from './cv.js';
import settings from './settings.js';
import terminal from './terminal.js';
import text from './text.js';
import wip from './wip.js';
import viewer from './viewer.js';
import welcome from './welcome.js';

export const APPS = {
  explorer, project, skill, knowledge, about, experience, education,
  languages, contact, cv, settings, terminal, text, wip, viewer, welcome,
};
