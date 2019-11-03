import Solution from '../src/'

/**
 * Dummy test
 */
describe('Solution test', () => {
  it('atoi(101)', () => {
    expect(Solution.atoi('101')).toBe(101)
  })
  it('atoi(+101)', () => {
    expect(Solution.atoi('+101')).toBe(101)
  })
  it('atoi( +101)', () => {
    expect(Solution.atoi(' +101')).toBe(101)
  })
  it('atoi( + 101)', () => {
    expect(Solution.atoi(' + 101')).toBe(0)
  })
  it('atoi( +1 01)', () => {
    expect(Solution.atoi(' +1 01')).toBe(1)
  })
  it('atoi(-101)', () => {
    expect(Solution.atoi('-101')).toBe(-101)
  })
  it('atoi(  101)', () => {
    expect(Solution.atoi('  101')).toBe(101)
  })
  it('atoi(  -101)', () => {
    expect(Solution.atoi('  -101')).toBe(-101)
  })
  it('atoi(  -1 01)', () => {
    expect(Solution.atoi('  -1 01')).toBe(-1)
  })
  it('atoi(x101)', () => {
    expect(Solution.atoi('x101')).toBe(0)
  })
  it('atoi(101 1)', () => {
    expect(Solution.atoi('101 1')).toBe(101)
  })
})
