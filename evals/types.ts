export interface EvalCase {
  name: string;
  passed: boolean;
  score?: number;
  note?: string;
}

export interface EvalSet {
  name: string;
  /** Minimum pass-rate (0..1) required for this set to be green. */
  threshold: number;
  run(): Promise<EvalCase[]>;
}
