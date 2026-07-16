/**
 * 确定性随机数生成器
 * 
 * 使用 Mulberry32 算法，相同种子产生相同的随机数序列。
 * 参见 docs/data/fixed-point-spec.md §4
 */

export class DeterministicRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** 生成 [0, 1) 之间的随机数 */
  next(): number {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** 生成 [min, max) 之间的随机整数 */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min));
  }

  /** 生成 [min, max] 之间的随机浮点数 */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}
