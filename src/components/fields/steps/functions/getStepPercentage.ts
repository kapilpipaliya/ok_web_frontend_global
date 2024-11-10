export function getStepPercentage(
  currentStepIndex: number,
  totalSteps: number,
  isValid = true,
  saveAndContinueLater = false,
): number {
  if (totalSteps <= 0) {
    return 0;
  }
  if (!isValid) {
    return Math.round((currentStepIndex / totalSteps) * 100);
  }
  let percentage = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  if (saveAndContinueLater && currentStepIndex === totalSteps - 1) {
    percentage -= 1;
  }
  return percentage;
}
