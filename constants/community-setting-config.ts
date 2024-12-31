export const formatTime = (minutes: number): string => `${minutes} minutes`;
export const formatMinutes = (ms: number): string => `${ms / (60 * 1000)} minutes`;
export const formatSol = (value: number): string => `${value} SOL`;

export const SETTINGS_CONFIG = {
  minContributionSol: {
    title: "Minimum Contribution",
    description: "Minimum amount that can be contributed per transaction",
    iconType: "sol",
    format: formatSol,
    category: 'investment',
    options: [0.1, 0.2, 0.3, 0.5].map(value => ({
      value,
      label: `${value} SOL`
    }))
  },
  maxContributionSol: {
    title: "Maximum Contribution",
    description: "Maximum amount that can be contributed per transaction",
    iconType: "sol",
    format: formatSol,
    category: 'investment',
    options: [0.5, 1, 1.5, 2].map(value => ({
      value,
      label: `${value} SOL`
    }))
  },
  votingTimeLimit: {
    title: "Voting Time Limit",
    description: "Set how long voting periods should last",
    iconType: "clock",
    format: formatMinutes,
    category: 'timing',
    options: [1, 3, 5, 10].map(min => ({
      value: min * 60 * 1000,
      label: `${min} minutes`
    }))
  },
  nextSessionDelay: {
    title: "Next Session Delay",
    description: "Time between sessions",
    iconType: "timer",
    format: formatMinutes,
    category: 'timing',
    options: [5, 10, 15, 30].map(min => ({
      value: min * 60 * 1000,
      label: `${min} minutes`
    }))
  },
  contributeFundingLimit: {
    title: "Contribution Time Limit",
    description: "How long users can contribute funds",
    iconType: "wallet",
    format: formatMinutes,
    category: 'timing',
    options: [3, 5, 10, 15].map(min => ({
      value: min * 60 * 1000,
      label: `${min} minutes`
    }))
  }
} as const;