export function mountPhone(app) {
  app.textContent = 'phone';
  return { openNode() {}, destroy() { app.replaceChildren(); } };
}
