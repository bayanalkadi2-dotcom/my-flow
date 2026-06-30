export const groundingExercise = {
  id: 'five-four-three-two-one',
  title: '5-4-3-2-1-Übung',
  completionText: 'Geschafft. Du hast die Übung abgeschlossen.',
  steps: [
    { id: 'see', expectedCount: 5, prompt: 'Nenne fünf Dinge, die du sehen kannst.' },
    { id: 'feel', expectedCount: 4, prompt: 'Nenne vier Dinge, die du fühlen kannst.' },
    { id: 'hear', expectedCount: 3, prompt: 'Nenne drei Dinge, die du hören kannst.' },
    { id: 'smell', expectedCount: 2, prompt: 'Nenne zwei Dinge, die du riechen kannst.' },
    { id: 'notice', expectedCount: 1, prompt: 'Nenne eine Sache, die du gerade bewusst wahrnimmst.' },
  ],
}

export function evaluateGroundingAnswer(answer, expectedCount) {
  const normalizedAnswer = String(answer ?? '').trim()
  if (!normalizedAnswer) {
    return {
      isEnough: false,
      count: 0,
      feedback: 'Ich konnte dich nicht gut verstehen. Versuche es noch einmal oder schreibe deine Antwort.',
    }
  }

  const entries = normalizedAnswer
    .split(/(?:\s*(?:,|;|\n|\bund\b)\s*|\s+[•-]\s+|\s+\d+[.)]\s+)/i)
    .map((entry) => entry.trim())
    .filter(Boolean)
  const count = Math.max(entries.length, 1)

  if (count >= expectedCount) {
    return { isEnough: true, count, feedback: 'Super, das reicht.' }
  }

  const missingCount = expectedCount - count
  return {
    isEnough: false,
    count,
    feedback: `Ich habe bisher ${count} ${count === 1 ? 'Ding' : 'Dinge'} erkannt. ${missingCount === 1 ? 'Fällt dir noch eines ein?' : `Fallen dir noch ${missingCount} weitere ein?`}`,
  }
}

