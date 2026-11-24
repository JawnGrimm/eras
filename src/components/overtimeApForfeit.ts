export function getOvertimeApForfeitPrompt(overtimeUsedToday: boolean, apRemaining: number): string | null {
  if (!overtimeUsedToday || apRemaining <= 0) return null;
  const pronoun = apRemaining === 1 ? 'it' : 'them';
  return `You have ${apRemaining} unused Overtime AP remaining. End the day and forfeit ${pronoun}?`;
}
