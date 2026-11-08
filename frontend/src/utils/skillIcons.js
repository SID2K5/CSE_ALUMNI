export const skillIcons = {
  react: "⚛️",
  node: "🟢",
  python: "🐍",
  java: "☕",
  javascript: "🟨",
  c: "💻",
  cpp: "⚙️",
  ai: "🤖",
  machinelearning: "📊",
  mongodb: "🍃",
  express: "🚀",
  html: "🌐",
  css: "🎨",
  git: "🔧",
};

export const getSkillIcon = (skill = "") => {
  if (!skill || typeof skill !== "string") return "✨";

  const key = skill.toLowerCase().replace(/\s/g, "");
  return skillIcons[key] || "✨";
};