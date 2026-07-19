/**
 * Shared inline-style tokens for React Email templates.
 * Email clients strip <style> class rules unpredictably, so every
 * template composes its markup from these plain style objects instead.
 */

import type { CSSProperties } from "react";
import { BRAND_COLORS } from "../config";

export const colors = BRAND_COLORS;

export const bodyStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: colors.BACKGROUND,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  fontSize: "16px",
  lineHeight: "1.6",
  color: colors.TEXT_PRIMARY,
};

export const containerStyle: CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: colors.WHITE,
};

export const headerStyle: CSSProperties = {
  // backgroundColor is the fallback Outlook desktop (Word rendering engine)
  // actually honors; backgroundImage layers the gradient on top for every
  // other client. Never rely on the `background` shorthand alone here.
  backgroundColor: colors.PRIMARY,
  backgroundImage: `linear-gradient(135deg, ${colors.PRIMARY} 0%, ${colors.SECONDARY} 100%)`,
  padding: "36px 30px",
  textAlign: "center",
};

export const avatarStyle: CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  border: "3px solid rgba(255,255,255,0.5)",
  display: "block",
  margin: "0 auto 14px auto",
  objectFit: "cover",
};

export const headerTitleStyle: CSSProperties = {
  margin: 0,
  color: colors.WHITE,
  fontSize: "24px",
  fontWeight: 700,
  letterSpacing: "-0.3px",
};

export const roleTagStyle: CSSProperties = {
  display: "inline-block",
  marginTop: "10px",
  padding: "4px 12px",
  borderRadius: "999px",
  backgroundColor: "rgba(255,255,255,0.16)",
  color: colors.WHITE,
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

export const signatureStyle: CSSProperties = {
  marginTop: "32px",
  paddingTop: "20px",
  borderTop: "1px solid #E5E7EB",
  color: colors.TEXT_SECONDARY,
  fontSize: "14px",
};

export const bodyPaddingStyle: CSSProperties = {
  padding: "40px 30px",
};

export const footerStyle: CSSProperties = {
  backgroundColor: colors.BACKGROUND,
  padding: "30px",
  textAlign: "center",
  borderTop: "1px solid #E5E7EB",
};

export const h2Style: CSSProperties = {
  margin: "0 0 20px 0",
  fontWeight: 600,
  lineHeight: 1.3,
  fontSize: "24px",
  color: colors.TEXT_PRIMARY,
};

export const h3Style: CSSProperties = {
  margin: "0 0 12px 0",
  fontWeight: 600,
  lineHeight: 1.3,
  fontSize: "20px",
  color: colors.TEXT_PRIMARY,
};

export const pStyle: CSSProperties = {
  margin: "0 0 20px 0",
  color: colors.TEXT_SECONDARY,
};

export const cardStyle: CSSProperties = {
  backgroundColor: colors.WHITE,
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  padding: "24px",
  margin: "20px 0",
};

export const cardHighlightStyle: CSSProperties = {
  ...cardStyle,
  backgroundColor: colors.BACKGROUND,
  borderLeft: `4px solid ${colors.PRIMARY}`,
};

export const btnStyle: CSSProperties = {
  display: "inline-block",
  padding: "14px 28px",
  backgroundColor: colors.PRIMARY,
  color: colors.WHITE,
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "16px",
  textAlign: "center",
};

export const btnSecondaryStyle: CSSProperties = {
  ...btnStyle,
  backgroundColor: "transparent",
  color: colors.PRIMARY,
  border: `2px solid ${colors.PRIMARY}`,
};

export const messageBlockStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  backgroundColor: colors.BACKGROUND,
  padding: "16px",
  borderRadius: "8px",
  borderLeft: `4px solid ${colors.PRIMARY}`,
  color: colors.TEXT_PRIMARY,
  margin: 0,
};

export const tagStyle: CSSProperties = {
  backgroundColor: "#EBF4FF",
  color: colors.PRIMARY,
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 500,
  marginRight: "6px",
  display: "inline-block",
};
