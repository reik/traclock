import { describe, it, expect } from 'vitest'
import { formatTime, toSeconds, fromSeconds } from './time'

describe('formatTime', () => {
  it('should_format_zero_as_00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })
  it('should_format_90_seconds_as_01:30', () => {
    expect(formatTime(90)).toBe('01:30')
  })
  it('should_pad_single_digit_seconds', () => {
    expect(formatTime(65)).toBe('01:05')
  })
})

describe('toSeconds', () => {
  it('should_convert_1_min_30_sec_to_90', () => {
    expect(toSeconds(1, 30)).toBe(90)
  })
  it('should_handle_zero_minutes', () => {
    expect(toSeconds(0, 45)).toBe(45)
  })
})

describe('fromSeconds', () => {
  it('should_convert_90_to_1_min_30_sec', () => {
    expect(fromSeconds(90)).toEqual({ minutes: 1, seconds: 30 })
  })
  it('should_convert_65_to_1_min_5_sec', () => {
    expect(fromSeconds(65)).toEqual({ minutes: 1, seconds: 5 })
  })
})
