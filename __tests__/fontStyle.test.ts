import { fontTagTextStyle, parseFontSizeAttr } from '../src/MarkdownRenderer/fontStyle';

describe('fontStyle', () => {
  it('parses px and legacy font sizes', () => {
    expect(parseFontSizeAttr('14px')).toBe(14);
    expect(parseFontSizeAttr('3')).toBe(16);
  });

  it('applies color and scaled line height', () => {
    const style = fontTagTextStyle('#FF5B5B', '14px', {
      fontSize: 14,
      lineHeight: 25,
      color: '#000',
    });
    expect(style.color).toBe('#FF5B5B');
    expect(style.fontSize).toBe(14);
    expect(style.lineHeight).toBe(25);
  });
});
