import type { PerformanceInput, PerformanceScoreResult } from '../../types/domain'
import { calculatePerformanceScore } from '../../utils/calculatePerformanceScore'

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const mockPerformanceService = {
  async analyze(input: PerformanceInput): Promise<PerformanceScoreResult> {
    await delay(1200)
    return calculatePerformanceScore(input)
  },
}
