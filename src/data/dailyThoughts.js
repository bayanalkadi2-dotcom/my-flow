const dailyThoughts = [
  'Du musst heute nicht perfekt sein. Ein kleiner Schritt reicht.',
  'Auch langsamer Fortschritt ist Fortschritt.',
  'Dein zukünftiges Ich wird dir für den heutigen Anfang danken.',
  'Pausen gehören genauso zum Fortschritt wie produktive Phasen.',
  'Konzentriere dich heute auf das, was du beeinflussen kannst.',
  'Ein ruhiger Start kann trotzdem ein guter Start sein.',
  'Heute zählt nicht alles auf einmal, sondern der nächste machbare Schritt.',
  'Kleine Routinen bauen große Veränderungen leise auf.',
  'Du darfst lernen, ohne dich zu überfordern.',
  'Ein klarer Kopf beginnt oft mit einer kurzen Pause.',
  'Wenn es schwer wirkt, mach es kleiner.',
  'Jede erledigte Kleinigkeit ist ein Signal: Du bist dran geblieben.',
  'Dein Tempo darf heute menschlich sein.',
  'Ein guter Tag muss nicht voll sein, nur bewusst.',
  'Lernen funktioniert besser, wenn Erholung mit eingeplant ist.',
  'Du kannst neu anfangen, auch mitten am Tag.',
  'Ein Glas Wasser, ein tiefer Atemzug, ein kleiner Plan: das reicht als Anfang.',
  'Ordnung entsteht selten auf einmal, sondern Schritt für Schritt.',
  'Mach heute das Nächste, nicht alles.',
  'Du bist nicht hinterher, du bist unterwegs.',
  'Kurze Konzentration ist wertvoller als langes Aufschieben.',
  'Dein Alltag darf leicht anfangen.',
  'Selbstfürsorge ist kein Extra, sie gehört zum Plan.',
  'Eine kleine Entscheidung kann den ganzen Tag freundlicher machen.',
  'Motivation wächst oft erst nach dem Start.',
  'Heute darf Fortschritt leise sein.',
  'Ein überschaubarer Plan schlägt einen perfekten Plan.',
  'Du darfst produktiv sein und trotzdem Pausen brauchen.',
  'Was du heute beginnst, muss nicht perfekt enden.',
  'Bleib freundlich mit dir, besonders an vollen Tagen.',
  'Jede Routine, die du pflegst, macht morgen ein bisschen leichter.',
  'Ein guter Lernblock beginnt mit einem klaren ersten Handgriff.',
]

function getDayNumber(date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const difference = date - startOfYear
  return Math.floor(difference / 86400000)
}

export function getDailyThought(date = new Date()) {
  const dayNumber = getDayNumber(date)
  return dailyThoughts[dayNumber % dailyThoughts.length]
}

export default dailyThoughts
